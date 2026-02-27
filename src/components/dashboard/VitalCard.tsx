import { VitalConfig, VitalReading, getTrend } from "@/lib/mockData";
import { Heart, Activity, Wind, Thermometer, Waves, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

const iconMap: Record<string, React.ElementType> = {
  Heart, Activity, Wind, Thermometer, Waves,
};

interface Props {
  config: VitalConfig;
  value: number;
  secondaryValue?: number;
  status: "normal" | "warning" | "critical";
  history: VitalReading[];
  colorClass: string;
}

export default function VitalCard({ config, value, secondaryValue, status, history, colorClass }: Props) {
  const Icon = iconMap[config.icon] || Heart;
  const trend = getTrend(history.map(h => h.value));
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const statusAccent = {
    normal: "text-success",
    warning: "text-warning",
    critical: "text-destructive",
  };

  const sparkColors: Record<string, string> = {
    normal: "hsl(160, 55%, 42%)",
    warning: "hsl(38, 92%, 55%)",
    critical: "hsl(0, 72%, 58%)",
  };

  const displayValue = config.key === "systolic" && secondaryValue !== undefined
    ? `${value}/${secondaryValue}`
    : config.decimals > 0 ? value.toFixed(config.decimals) : value;

  const sparkColor = sparkColors[status];

  return (
    <div className={`${colorClass} p-4 transition-all duration-500 animate-fade-in relative overflow-hidden ${
      status === "critical" ? "ring-2 ring-destructive/40 pulse-critical" : ""
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-card/70 flex items-center justify-center shadow-sm">
            <Icon className={`w-4 h-4 ${statusAccent[status]}`} />
          </div>
          <span className="text-xs font-medium text-foreground/70">{config.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendIcon className={`w-3.5 h-3.5 ${statusAccent[status]}`} />
          <div className={`w-2 h-2 rounded-full ${
            status === "normal" ? "bg-success pulse-live" :
            status === "warning" ? "bg-warning" : "bg-destructive pulse-live"
          }`} />
        </div>
      </div>

      {/* Value */}
      <div className="mb-2">
        <span className="text-3xl font-bold font-display tracking-tight text-foreground">
          {displayValue}
        </span>
        <span className="text-sm text-muted-foreground ml-1.5 font-medium">{config.unit}</span>
      </div>

      {/* Sparkline */}
      {history.length > 2 && (
        <div className="h-10 -mx-1 mb-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id={`grad-${config.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparkColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={sparkColor}
                strokeWidth={2}
                fill={`url(#grad-${config.key})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between text-[10px] text-foreground/50 font-medium">
        <span>{config.normalRange[0]}–{config.normalRange[1]} {config.unit}</span>
        <span className={`uppercase font-semibold ${statusAccent[status]}`}>{status}</span>
      </div>
    </div>
  );
}
