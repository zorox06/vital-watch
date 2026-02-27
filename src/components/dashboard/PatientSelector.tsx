import { PATIENTS, Patient } from "@/lib/mockData";
import { Battery, Wifi, Clock, Bell, ChevronRight } from "lucide-react";

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

const avatarColors = [
  "bg-mint text-mint-foreground",
  "bg-peach text-peach-foreground",
  "bg-sky text-sky-foreground",
  "bg-lavender text-lavender-foreground",
  "bg-mint text-mint-foreground",
];

export default function PatientSelector({ selectedId, onSelect }: Props) {
  const selected = PATIENTS.find(p => p.id === selectedId)!;
  const selectedIdx = PATIENTS.findIndex(p => p.id === selectedId);

  return (
    <div className="space-y-4">
      {/* Greeting + selected patient */}
      <div className="soft-card p-5">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold font-display ${avatarColors[selectedIdx]}`}>
            {selected.photo}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">Monitoring</p>
            <h2 className="text-xl font-bold font-display text-foreground truncate">{selected.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{selected.age}{selected.gender} · {selected.room}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5 text-xs">
              <Battery className="w-3.5 h-3.5 text-muted-foreground" />
              <span className={`font-mono font-medium ${selected.sensorBattery < 50 ? "text-warning" : "text-success"}`}>{selected.sensorBattery}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Wifi className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-mono font-medium text-success">{selected.sensorSignal}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>Now</span>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{selected.diagnosis}</p>
              <p className="text-xs font-medium text-primary mt-0.5">{selected.doctor}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Patient pills */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {PATIENTS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-medium transition-all duration-200 ${
              p.id === selectedId
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "soft-card hover:shadow-md"
            }`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-bold ${
              p.id === selectedId ? "bg-primary-foreground/20" : avatarColors[i]
            }`}>
              {p.photo}
            </div>
            <span>{p.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
