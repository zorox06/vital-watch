export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F";
  room: string;
  photo: string;
  admissionDate: string;
  diagnosis: string;
  doctor: string;
  sensorBattery: number;
  sensorSignal: number;
  lastSync: Date;
}

export interface VitalReading {
  timestamp: number;
  value: number;
}

export interface Vitals {
  heartRate: number;
  systolic: number;
  diastolic: number;
  spo2: number;
  temperature: number;
  respRate: number;
}

export interface VitalConfig {
  key: keyof Vitals;
  label: string;
  unit: string;
  icon: string;
  normalRange: [number, number];
  warningRange: [number, number];
  criticalMin: number;
  criticalMax: number;
  decimals: number;
}

export interface AlertEntry {
  id: string;
  patientId: string;
  patientName: string;
  vital: string;
  value: number;
  threshold: string;
  severity: "Critical" | "High" | "Medium";
  timestamp: Date;
  acknowledged: boolean;
  workflowStatus: "Pending" | "Dispatched" | "En Route" | "Arrived";
  eta?: number;
}

export const VITAL_CONFIGS: VitalConfig[] = [
  { key: "heartRate", label: "Heart Rate", unit: "BPM", icon: "Heart", normalRange: [60, 100], warningRange: [50, 120], criticalMin: 40, criticalMax: 130, decimals: 0 },
  { key: "systolic", label: "Blood Pressure", unit: "mmHg", icon: "Activity", normalRange: [90, 140], warningRange: [80, 160], criticalMin: 70, criticalMax: 180, decimals: 0 },
  { key: "spo2", label: "SpO2", unit: "%", icon: "Wind", normalRange: [95, 100], warningRange: [90, 95], criticalMin: 90, criticalMax: 101, decimals: 1 },
  { key: "temperature", label: "Temperature", unit: "°F", icon: "Thermometer", normalRange: [97, 99.5], warningRange: [96, 101], criticalMin: 95, criticalMax: 104, decimals: 1 },
  { key: "respRate", label: "Resp. Rate", unit: "/min", icon: "Waves", normalRange: [12, 20], warningRange: [10, 25], criticalMin: 8, criticalMax: 30, decimals: 0 },
];

export const PATIENTS: Patient[] = [
  { id: "p1", name: "John D.", age: 67, gender: "M", room: "ICU-204", photo: "JD", admissionDate: "2026-02-24", diagnosis: "Post-CABG Surgery", doctor: "Dr. Patel", sensorBattery: 87, sensorSignal: 95, lastSync: new Date() },
  { id: "p2", name: "Sarah K.", age: 54, gender: "F", room: "ICU-207", photo: "SK", admissionDate: "2026-02-25", diagnosis: "Acute MI Monitoring", doctor: "Dr. Chen", sensorBattery: 62, sensorSignal: 88, lastSync: new Date() },
  { id: "p3", name: "Robert M.", age: 73, gender: "M", room: "CCU-101", photo: "RM", admissionDate: "2026-02-23", diagnosis: "CHF Exacerbation", doctor: "Dr. Patel", sensorBattery: 94, sensorSignal: 92, lastSync: new Date() },
  { id: "p4", name: "Emily L.", age: 41, gender: "F", room: "ICU-210", photo: "EL", admissionDate: "2026-02-26", diagnosis: "Sepsis Protocol", doctor: "Dr. Nguyen", sensorBattery: 45, sensorSignal: 78, lastSync: new Date() },
  { id: "p5", name: "James W.", age: 82, gender: "M", room: "CCU-103", photo: "JW", admissionDate: "2026-02-22", diagnosis: "Respiratory Failure", doctor: "Dr. Chen", sensorBattery: 71, sensorSignal: 91, lastSync: new Date() },
];

const baseVitals: Record<string, Vitals> = {
  p1: { heartRate: 78, systolic: 128, diastolic: 82, spo2: 97.2, temperature: 98.4, respRate: 16 },
  p2: { heartRate: 92, systolic: 145, diastolic: 95, spo2: 95.8, temperature: 99.1, respRate: 19 },
  p3: { heartRate: 68, systolic: 155, diastolic: 98, spo2: 93.5, temperature: 98.6, respRate: 22 },
  p4: { heartRate: 110, systolic: 95, diastolic: 62, spo2: 94.1, temperature: 101.8, respRate: 24 },
  p5: { heartRate: 58, systolic: 138, diastolic: 88, spo2: 91.2, temperature: 97.9, respRate: 26 },
};

function jitter(value: number, range: number): number {
  return value + (Math.random() - 0.5) * range;
}

export function generateVitals(patientId: string): Vitals {
  const base = baseVitals[patientId] || baseVitals.p1;
  return {
    heartRate: Math.round(jitter(base.heartRate, 8)),
    systolic: Math.round(jitter(base.systolic, 10)),
    diastolic: Math.round(jitter(base.diastolic, 6)),
    spo2: parseFloat(jitter(base.spo2, 2).toFixed(1)),
    temperature: parseFloat(jitter(base.temperature, 0.6).toFixed(1)),
    respRate: Math.round(jitter(base.respRate, 3)),
  };
}

export function getVitalStatus(key: keyof Vitals, value: number): "normal" | "warning" | "critical" {
  const config = VITAL_CONFIGS.find(c => c.key === key);
  if (!config) return "normal";
  if (value <= config.criticalMin || value >= config.criticalMax) return "critical";
  if (value < config.warningRange[0] || value > config.warningRange[1]) return "warning";
  return "normal";
}

export function computeRiskScore(vitals: Vitals): number {
  let score = 0;
  for (const config of VITAL_CONFIGS) {
    const val = config.key === "systolic" ? vitals.systolic : config.key === "diastolic" ? vitals.diastolic : vitals[config.key];
    const status = getVitalStatus(config.key, val as number);
    if (status === "critical") score += 25;
    else if (status === "warning") score += 12;
    else score += 2;
  }
  return Math.min(100, score);
}

export function getTrend(history: number[]): "up" | "down" | "stable" {
  if (history.length < 5) return "stable";
  const recent = history.slice(-5);
  const slope = recent[recent.length - 1] - recent[0];
  if (slope > 3) return "up";
  if (slope < -3) return "down";
  return "stable";
}
