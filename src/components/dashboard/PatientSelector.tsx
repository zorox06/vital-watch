import { PATIENTS, Patient } from "@/lib/mockData";
import { Battery, Wifi, Clock } from "lucide-react";

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function PatientSelector({ selectedId, onSelect }: Props) {
  const selected = PATIENTS.find(p => p.id === selectedId)!;

  return (
    <div className="space-y-3">
      {/* Selected patient info */}
      <div className="glass-card p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm font-mono">
          {selected.photo}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground truncate">{selected.name} <span className="text-muted-foreground text-sm">{selected.age}{selected.gender}</span></h2>
          <p className="text-xs text-muted-foreground">{selected.room} · {selected.diagnosis}</p>
          <p className="text-xs text-primary/70">{selected.doctor}</p>
        </div>
        <div className="flex flex-col gap-1 items-end text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Battery className="w-3 h-3" />
            <span className={selected.sensorBattery < 50 ? "text-warning" : "text-primary"}>{selected.sensorBattery}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            <span>{selected.sensorSignal}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Just now</span>
          </div>
        </div>
      </div>

      {/* Patient tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PATIENTS.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              p.id === selectedId
                ? "bg-primary/20 text-primary border border-primary/40"
                : "bg-secondary/50 text-muted-foreground border border-transparent hover:border-border hover:text-foreground"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
