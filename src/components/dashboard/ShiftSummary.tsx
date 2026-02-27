import { Vitals, PATIENTS } from "@/lib/mockData";
import { FileText } from "lucide-react";

interface Props {
  patientId: string;
  vitals: Vitals;
  alertCount: number;
}

export default function ShiftSummary({ patientId, vitals, alertCount }: Props) {
  const patient = PATIENTS.find(p => p.id === patientId);
  
  const summary = [
    `Heart rate ${vitals.heartRate > 100 ? "elevated" : vitals.heartRate < 60 ? "low" : "stable"} at ${vitals.heartRate} BPM.`,
    `Blood pressure ${vitals.systolic > 140 ? "high" : "within range"} at ${vitals.systolic}/${vitals.diastolic}.`,
    `SpO2 ${vitals.spo2 < 94 ? "below target" : "adequate"} at ${vitals.spo2}%.`,
    `Temperature ${vitals.temperature > 100 ? "febrile" : "normal"} at ${vitals.temperature}°F.`,
    alertCount > 0 ? `${alertCount} alert(s) recorded this session.` : "No alerts triggered.",
  ].join(" ");

  return (
    <div className="soft-card p-5 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-lavender flex items-center justify-center">
          <FileText className="w-4 h-4 text-lavender-foreground" />
        </div>
        <h3 className="text-sm font-bold font-display text-foreground">Shift Summary</h3>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{summary}</p>
      <p className="text-[10px] text-muted-foreground/50 font-mono">Auto-generated · {new Date().toLocaleTimeString()}</p>
    </div>
  );
}
