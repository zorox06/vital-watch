import { useState } from "react";
import { VITAL_CONFIGS } from "@/lib/mockData";
import { Save, RotateCcw, Sliders } from "lucide-react";

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

  const presetColors = ["mint-card", "sky-card", "peach-card", "lavender-card"];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-sky flex items-center justify-center">
          <Sliders className="w-4 h-4 text-sky-foreground" />
        </div>
        <h2 className="text-sm font-bold font-display text-foreground">Alert Thresholds</h2>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(PRESETS) as PresetKey[]).map((key, i) => (
          <button
            key={key}
            onClick={() => handlePreset(key)}
            className={`p-3 rounded-2xl text-xs font-medium transition-all text-left ${
              preset === key
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/15"
                : `${presetColors[i]} text-foreground hover:shadow-md`
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Threshold controls */}
      <div className="space-y-3">
        {Object.entries(thresholds).map(([key, range]) => {
          const config = VITAL_CONFIGS.find(c => c.key === key);
          if (!config) return null;
          const [min, max] = range as [number, number];
          return (
            <div key={key} className="soft-card p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-foreground">{config.label}</span>
                <span className="text-xs font-mono text-primary font-medium">{min} – {max} {config.unit}</span>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground mb-1 block">Min</label>
                  <input
                    type="range"
                    min={config.criticalMin - 20}
                    max={config.criticalMax}
                    value={min}
                    onChange={e => setThresholds((prev: any) => ({ ...prev, [key]: [Number(e.target.value), max] }))}
                    className="w-full h-1.5 rounded-full appearance-none bg-muted accent-primary"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground mb-1 block">Max</label>
                  <input
                    type="range"
                    min={config.criticalMin}
                    max={config.criticalMax + 20}
                    value={max}
                    onChange={e => setThresholds((prev: any) => ({ ...prev, [key]: [min, Number(e.target.value)] }))}
                    className="w-full h-1.5 rounded-full appearance-none bg-muted accent-primary"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 hover:shadow-lg active:scale-95 transition-all"
        >
          <Save className="w-4 h-4" />
          {saved ? "✓ Saved!" : "Save Thresholds"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-3.5 rounded-2xl bg-muted text-muted-foreground font-medium text-sm hover:bg-muted/80 active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
