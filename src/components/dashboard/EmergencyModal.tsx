import { AlertEntry } from "@/lib/mockData";
import { AlertTriangle, Phone, Stethoscope } from "lucide-react";

interface Props {
  alert: AlertEntry;
  onAcknowledge: (id: string) => void;
  onDispatch: (id: string) => void;
}

export default function EmergencyModal({ alert, onAcknowledge, onDispatch }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => onAcknowledge(alert.id)} />
      <div className="relative bg-card rounded-3xl border border-destructive/20 shadow-2xl p-6 max-w-md w-full animate-slide-up space-y-5">
        {/* Pulsing red badge */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center pulse-critical">
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-destructive">Emergency Alert</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{alert.patientName} · {alert.timestamp.toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Details */}
        <div className="bg-destructive/5 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Vital Sign</span>
            <span className="font-semibold text-foreground">{alert.vital}</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-muted-foreground">Reading</span>
            <span className="font-mono font-bold text-destructive text-2xl">{alert.value}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Normal Range</span>
            <span className="font-mono text-muted-foreground">{alert.threshold}</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-muted-foreground">Severity</span>
            <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold">{alert.severity}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => onDispatch(alert.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-destructive text-destructive-foreground font-semibold text-sm shadow-lg shadow-destructive/20 hover:shadow-destructive/30 transition-all active:scale-95"
          >
            <Phone className="w-4 h-4" />
            Dispatch
          </button>
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-muted text-foreground font-semibold text-sm hover:bg-muted/80 transition-all active:scale-95"
          >
            <Stethoscope className="w-4 h-4" />
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
