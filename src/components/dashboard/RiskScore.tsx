interface Props {
  score: number;
}

export default function RiskScore({ score }: Props) {
  const getColor = () => {
    if (score >= 70) return { color: "hsl(0, 85%, 55%)", label: "Critical Risk", bg: "bg-destructive/10" };
    if (score >= 45) return { color: "hsl(38, 92%, 55%)", label: "Elevated Risk", bg: "bg-warning/10" };
    return { color: "hsl(153, 100%, 50%)", label: "Low Risk", bg: "bg-primary/10" };
  };

  const { color, label, bg } = getColor();
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`glass-card p-4 flex items-center gap-4 ${bg} border border-white/5`}>
      <div className="relative w-20 h-20 flex-shrink-0">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="hsl(225, 25%, 20%)" strokeWidth="6" fill="none" />
          <circle
            cx="50" cy="50" r="40"
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold font-mono" style={{ color }}>{score}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color }}>{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">AI-computed composite risk from all vitals trends</p>
      </div>
    </div>
  );
}
