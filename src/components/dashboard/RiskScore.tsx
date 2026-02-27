interface Props {
  score: number;
}

export default function RiskScore({ score }: Props) {
  const getInfo = () => {
    if (score >= 70) return { color: "hsl(0, 72%, 58%)", label: "Critical Risk", desc: "Immediate attention required", bg: "peach-card" };
    if (score >= 45) return { color: "hsl(38, 92%, 55%)", label: "Elevated Risk", desc: "Monitor closely, trending toward concern", bg: "accent-card" };
    return { color: "hsl(160, 55%, 42%)", label: "Low Risk", desc: "All vitals within normal range", bg: "mint-card" };
  };

  const { color, label, desc, bg } = getInfo();
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`${bg} p-5 flex items-center gap-5`}>
      <div className="relative w-20 h-20 flex-shrink-0">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="38" stroke="hsl(0, 0%, 100%)" strokeWidth="7" fill="none" opacity="0.5" />
          <circle
            cx="50" cy="50" r="38"
            stroke={color}
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold font-display" style={{ color }}>{score}</span>
        </div>
      </div>
      <div>
        <p className="text-base font-bold font-display text-foreground">{label}</p>
        <p className="text-xs text-foreground/60 mt-0.5">{desc}</p>
        <p className="text-[10px] text-foreground/40 mt-1 font-mono">AI Risk Assessment</p>
      </div>
    </div>
  );
}
