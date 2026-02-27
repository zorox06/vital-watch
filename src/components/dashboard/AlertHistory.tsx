import { AlertEntry } from "@/lib/mockData";
import { AlertTriangle, Check, Truck } from "lucide-react";

interface Props {
  alerts: AlertEntry[];
}

export default function AlertHistory({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-muted-foreground text-sm">No alerts recorded</p>
        <p className="text-xs text-muted-foreground/60 mt-1">System monitoring all vitals</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.slice(0, 10).map(alert => (
        <div key={alert.id} className={`glass-card p-3 flex items-center gap-3 text-sm ${!alert.acknowledged ? "border border-destructive/30" : "border border-transparent"}`}>
          <div className={`p-1.5 rounded-full ${alert.acknowledged ? "bg-primary/15" : "bg-destructive/15"}`}>
            {alert.acknowledged ? <Check className="w-3 h-3 text-primary" /> : <AlertTriangle className="w-3 h-3 text-destructive" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-foreground">{alert.vital}: <span className="font-mono">{alert.value}</span></p>
            <p className="text-xs text-muted-foreground">{alert.timestamp.toLocaleTimeString()}</p>
          </div>
          <div className="text-right">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              alert.severity === "Critical" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"
            }`}>{alert.severity}</span>
            {alert.workflowStatus !== "Pending" && (
              <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                <Truck className="w-3 h-3" />
                {alert.workflowStatus}{alert.eta ? ` · ETA ${alert.eta}min` : ""}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
