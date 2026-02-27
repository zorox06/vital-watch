import { useState } from "react";
import { VitalReading, VITAL_CONFIGS, Vitals } from "@/lib/mockData";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface Props {
  history: Record<keyof Vitals, VitalReading[]>;
}

const chartColors: Record<string, string> = {
  heartRate: "hsl(0, 85%, 60%)",
  systolic: "hsl(38, 92%, 55%)",
  spo2: "hsl(200, 80%, 55%)",
  temperature: "hsl(280, 70%, 60%)",
  respRate: "hsl(153, 100%, 50%)",
};

export default function VitalsTimeline({ history }: Props) {
  const [activeVital, setActiveVital] = useState<keyof Vitals>("heartRate");
  const config = VITAL_CONFIGS.find(c => c.key === activeVital)!;
  const data = history[activeVital];
  const color = chartColors[activeVital] || "hsl(153, 100%, 50%)";

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Vitals Timeline</h3>
        <span className="text-[10px] text-muted-foreground font-mono">LIVE · Last 60s</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {VITAL_CONFIGS.map(c => (
          <button
            key={c.key}
            onClick={() => setActiveVital(c.key)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
              activeVital === c.key
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground"
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
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(225, 25%, 18%)" strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(v: number) => new Date(v).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" })}
                stroke="hsl(220, 15%, 35%)"
                fontSize={10}
                tickLine={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                stroke="hsl(220, 15%, 35%)"
                fontSize={10}
                tickLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{ background: "hsl(225, 40%, 12%)", border: "1px solid hsl(225, 25%, 25%)", borderRadius: "8px", fontSize: "12px" }}
                labelFormatter={(v: number) => new Date(v).toLocaleTimeString()}
                formatter={(v: number) => [`${v} ${config.unit}`, config.label]}
              />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#timelineGrad)" dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Collecting data...</div>
        )}
      </div>
    </div>
  );
}
