import { useState, useEffect, useRef, useCallback } from "react";
import { generateVitals, Vitals, VitalReading, getVitalStatus, VITAL_CONFIGS, AlertEntry } from "@/lib/mockData";

const HISTORY_LENGTH = 30;

export function useVitalsStream(patientId: string) {
  const [vitals, setVitals] = useState<Vitals>(generateVitals(patientId));
  const [history, setHistory] = useState<Record<keyof Vitals, VitalReading[]>>({
    heartRate: [], systolic: [], diastolic: [], spo2: [], temperature: [], respRate: [],
  });
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [activeAlert, setActiveAlert] = useState<AlertEntry | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    setActiveAlert(null);
  }, []);

  const dispatchEmergency = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, workflowStatus: "Dispatched", eta: 8, acknowledged: true } : a));
    setActiveAlert(null);
    // Simulate workflow progression
    setTimeout(() => setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, workflowStatus: "En Route", eta: 5 } : a)), 3000);
    setTimeout(() => setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, workflowStatus: "Arrived", eta: 0 } : a)), 8000);
  }, []);

  useEffect(() => {
    // Reset on patient change
    setHistory({ heartRate: [], systolic: [], diastolic: [], spo2: [], temperature: [], respRate: [] });
    setVitals(generateVitals(patientId));

    intervalRef.current = setInterval(() => {
      const newVitals = generateVitals(patientId);
      const now = Date.now();
      setVitals(newVitals);

      setHistory(prev => {
        const updated = { ...prev };
        for (const key of Object.keys(prev) as (keyof Vitals)[]) {
          const val = newVitals[key];
          const newArr = [...prev[key], { timestamp: now, value: val }];
          updated[key] = newArr.slice(-HISTORY_LENGTH);
        }
        return updated;
      });

      // Check for critical alerts
      for (const config of VITAL_CONFIGS) {
        const val = newVitals[config.key];
        const status = getVitalStatus(config.key, val);
        if (status === "critical") {
          const alertId = `alert-${now}-${config.key}`;
          const newAlert: AlertEntry = {
            id: alertId,
            patientId,
            patientName: "",
            vital: config.label,
            value: val,
            threshold: `${config.criticalMin}-${config.criticalMax}`,
            severity: "Critical",
            timestamp: new Date(),
            acknowledged: false,
            workflowStatus: "Pending",
          };
          setAlerts(prev => {
            // Prevent spamming same vital alerts
            const recentSame = prev.find(a => a.vital === config.label && !a.acknowledged && (now - a.timestamp.getTime()) < 15000);
            if (recentSame) return prev;
            return [newAlert, ...prev].slice(0, 20);
          });
          setActiveAlert(prev => {
            if (prev && !prev.acknowledged) return prev;
            return newAlert;
          });
        }
      }
    }, 2500);

    return () => clearInterval(intervalRef.current);
  }, [patientId]);

  return { vitals, history, alerts, activeAlert, acknowledgeAlert, dispatchEmergency };
}
