import { useState, useEffect } from "react";
import { VITAL_CONFIGS } from "@/lib/mockData";
import { Save, RotateCcw } from "lucide-react";

const PRESETS = {
  "Standard Adult": { heartRate: [60, 100], systolic: [90, 140], spo2: [95, 100], temperature: [97, 99.5], respRate: [12, 20] },
  "Elderly Patient": { heartRate: [55, 90], systolic: [100, 150], spo2: [92, 100], temperature: [96.5, 99], respRate: [14, 22] },
  "Post-Surgery": { heartRate: [50, 120], systolic: [85, 160], spo2: [93, 100], temperature: [97, 101], respRate: [10, 25] },
  "Pediatric": { heartRate: [70, 130], systolic: [75, 120], spo2: [95, 100], temperature: [97.5, 99.5], respRate: [15, 30] },
};

type PresetKey = keyof typeof PRESETS;

export default function ThresholdSettings() {
  const [preset, setPreset] = useState<PresetKey>("Standard Adult");
  const [thresholds, setThresholds] = useState(() => {
    const saved = localStorage.getItem("rpm-thresholds");
    return saved ? JSON.parse(saved) : PRESETS["Standard Adult"];
  });
  const [saved, setSaved] = useState(false);

  const handlePreset = (key: PresetKey) => {
    setPreset(key);
    setThresholds(PRESETS[key]);
  };

  const handleSave = () => {
    localStorage.setItem("rpm-thresholds", JSON.stringify(thresholds));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setThresholds(PRESETS["Standard Adult"]);
    setPreset("Standard Adult");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Alert Thresholds</h2>

      {/* Presets */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(PRESETS) as PresetKey[]).map(key => (
          <button
            key={key}
            onClick={() => handlePreset(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              preset === key ? "bg-primary/20 text-primary border border-primary/30" : "bg-secondary text-muted-foreground border border-transparent"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Threshold sliders */}
      <div className="space-y-3">
        {Object.entries(thresholds).map(([key, range]) => {
          const config = VITAL_CONFIGS.find(c => c.key === key);
          if (!config) return null;
          const [min, max] = range as [number, number];
          return (
            <div key={key} className="glass-card p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-foreground">{config.label}</span>
                <span className="text-xs font-mono text-primary">{min} – {max} {config.unit}</span>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="range"
                  min={config.criticalMin - 20}
                  max={config.criticalMax}
                  value={min}
                  onChange={e => setThresholds((prev: any) => ({ ...prev, [key]: [Number(e.target.value), max] }))}
                  className="flex-1 accent-primary h-1"
                />
                <input
                  type="range"
                  min={config.criticalMin}
                  max={config.criticalMax + 20}
                  value={max}
                  onChange={e => setThresholds((prev: any) => ({ ...prev, [key]: [min, Number(e.target.value)] }))}
                  className="flex-1 accent-primary h-1"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save Thresholds"}
        </button>
        <button onClick={handleReset} className="px-4 py-3 rounded-lg bg-secondary text-muted-foreground font-medium text-sm border border-border">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
