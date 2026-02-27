import { AlertEntry } from "@/lib/mockData";
import { AlertTriangle, Check, Truck, ArrowRight } from "lucide-react";

interface Props {
  alerts: AlertEntry[];
}

export default function AlertHistory({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="soft-card p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-mint mx-auto flex items-center justify-center mb-3">
          <Check className="w-6 h-6 text-success" />
        </div>
        <p className="text-sm font-medium text-foreground">All Clear</p>
        <p className="text-xs text-muted-foreground mt-1">No alerts recorded this session</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {alerts.slice(0, 10).map(alert => (
        <div key={alert.id} className={`soft-card p-4 flex items-center gap-3 ${!alert.acknowledged ? "ring-1 ring-destructive/20" : ""}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            alert.acknowledged ? "bg-mint" : "bg-destructive/10"
          }`}>
            {alert.acknowledged ? <Check className="w-4 h-4 text-success" /> : <AlertTriangle className="w-4 h-4 text-destructive" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {alert.vital} <span className="font-mono text-muted-foreground">·</span> <span className="font-mono">{alert.value}</span>
            </p>
            <p className="text-xs text-muted-foreground">{alert.timestamp.toLocaleTimeString()}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
              alert.severity === "Critical" ? "bg-destructive/10 text-destructive" : "bg-warning/15 text-warning"
            }`}>{alert.severity}</span>
            {alert.workflowStatus !== "Pending" && (
              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                <Truck className="w-3 h-3" />
                <span>{alert.workflowStatus}</span>
                {alert.eta ? <span className="text-primary font-mono">ETA {alert.eta}m</span> : null}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
