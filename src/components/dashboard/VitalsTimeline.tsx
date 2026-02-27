import { useState } from "react";
import { VitalReading, VITAL_CONFIGS, Vitals } from "@/lib/mockData";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface Props {
  history: Record<keyof Vitals, VitalReading[]>;
}

const chartColors: Record<string, string> = {
  heartRate: "hsl(0, 72%, 58%)",
  systolic: "hsl(38, 80%, 50%)",
  spo2: "hsl(200, 65%, 50%)",
  temperature: "hsl(260, 50%, 55%)",
  respRate: "hsl(160, 55%, 42%)",
};

export default function VitalsTimeline({ history }: Props) {
  const [activeVital, setActiveVital] = useState<keyof Vitals>("heartRate");
  const config = VITAL_CONFIGS.find(c => c.key === activeVital)!;
  const data = history[activeVital];
  const color = chartColors[activeVital] || "hsl(160, 55%, 42%)";

  return (
    <div className="soft-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold font-display text-foreground">Vitals Timeline</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success pulse-live" />
          <span className="text-[10px] text-muted-foreground font-mono">LIVE</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {VITAL_CONFIGS.map(c => (
          <button
            key={c.key}
            onClick={() => setActiveVital(c.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeVital === c.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-48">
        {data.length > 2 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(220, 15%, 92%)" strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(v: number) => new Date(v).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" })}
                stroke="hsl(220, 10%, 75%)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                stroke="hsl(220, 10%, 75%)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 15%, 90%)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                labelFormatter={(v: number) => new Date(v).toLocaleTimeString()}
                formatter={(v: number) => [`${v} ${config.unit}`, config.label]}
              />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill="url(#timelineGrad)" dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            <div className="text-center">
              <div className="w-8 h-8 rounded-xl bg-muted mx-auto mb-2 flex items-center justify-center">
                <span className="text-muted-foreground text-lg">⏳</span>
              </div>
              Collecting data...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
