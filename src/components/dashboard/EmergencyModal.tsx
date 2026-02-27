import { AlertEntry } from "@/lib/mockData";
import { AlertTriangle, Phone, Stethoscope, X } from "lucide-react";

interface Props {
  alert: AlertEntry;
  onAcknowledge: (id: string) => void;
  onDispatch: (id: string) => void;
}

export default function EmergencyModal({ alert, onAcknowledge, onDispatch }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: "flash-red 1.5s ease-in-out infinite" }}>
      <div className="absolute inset-0 bg-destructive/10 backdrop-blur-sm" />
      <div className="relative glass-card border-2 border-destructive pulse-critical p-6 max-w-md w-full animate-scale-in space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-destructive/20">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-destructive">EMERGENCY ALERT</h2>
            <p className="text-xs text-muted-foreground">{alert.timestamp.toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Details */}
        <div className="bg-destructive/10 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Vital</span>
            <span className="font-semibold text-destructive">{alert.vital}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Value</span>
            <span className="font-mono font-bold text-destructive text-lg">{alert.value}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Threshold</span>
            <span className="font-mono text-muted-foreground">{alert.threshold}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Severity</span>
            <span className="px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs font-bold">{alert.severity}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => onDispatch(alert.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-destructive text-destructive-foreground font-semibold text-sm hover:bg-destructive/90 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Dispatch Emergency
          </button>
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-secondary text-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors border border-border"
          >
            <Stethoscope className="w-4 h-4" />
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
