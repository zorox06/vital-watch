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
}

export default function VitalCard({ config, value, secondaryValue, status, history }: Props) {
  const Icon = iconMap[config.icon] || Heart;
  const trend = getTrend(history.map(h => h.value));

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const statusStyles = {
    normal: "border-primary/20 glow-border-green",
    warning: "border-warning/40 glow-border-yellow",
    critical: "border-destructive/60 pulse-critical",
  };

  const statusColors = {
    normal: "hsl(153, 100%, 50%)",
    warning: "hsl(38, 92%, 55%)",
    critical: "hsl(0, 85%, 55%)",
  };

  const sparkColor = statusColors[status];

  const displayValue = config.key === "systolic" && secondaryValue !== undefined
    ? `${value}/${secondaryValue}`
    : config.decimals > 0 ? value.toFixed(config.decimals) : value;

  return (
    <div className={`glass-card p-4 border ${statusStyles[status]} transition-all duration-500 animate-fade-in`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${status === "critical" ? "bg-destructive/20" : status === "warning" ? "bg-warning/20" : "bg-primary/15"}`}>
            <Icon className="w-4 h-4" style={{ color: sparkColor }} />
          </div>
          <span className="text-xs text-muted-foreground font-medium">{config.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendIcon className="w-3 h-3" style={{ color: sparkColor }} />
          <div className={`w-1.5 h-1.5 rounded-full ${status === "normal" ? "bg-primary pulse-live" : status === "warning" ? "bg-warning" : "bg-destructive pulse-critical"}`} />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <span className="text-3xl font-bold font-mono tracking-tight" style={{ color: sparkColor }}>
            {displayValue}
          </span>
          <span className="text-xs text-muted-foreground ml-1">{config.unit}</span>
        </div>
      </div>

      {/* Sparkline */}
      {history.length > 2 && (
        <div className="mt-3 h-12 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id={`grad-${config.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparkColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={sparkColor}
                strokeWidth={1.5}
                fill={`url(#grad-${config.key})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
        <span>Normal: {config.normalRange[0]}-{config.normalRange[1]}</span>
        <span className="uppercase font-medium" style={{ color: sparkColor }}>{status}</span>
      </div>
    </div>
  );
}
