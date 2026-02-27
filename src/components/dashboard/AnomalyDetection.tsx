import { AnomalyEvent } from '@/lib/mlEngine';
import { AlertTriangle, TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface Props {
    anomalies: AnomalyEvent[];
}

const typeIcons: Record<string, React.ElementType> = {
    spike: TrendingUp,
    drop: TrendingDown,
    outlier: Zap,
};

const severityColors: Record<string, string> = {
    low: 'bg-sky text-sky-foreground',
    medium: 'bg-accent/20 text-accent-foreground',
    high: 'bg-peach text-peach-foreground',
    critical: 'bg-destructive/10 text-destructive',
};

const severityRing: Record<string, string> = {
    low: '',
    medium: '',
    high: 'ring-1 ring-warning/30',
    critical: 'ring-2 ring-destructive/30 pulse-critical',
};

export default function AnomalyDetection({ anomalies }: Props) {
    if (anomalies.length === 0) {
        return (
            <div className="soft-card p-5 space-y-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-mint flex items-center justify-center">
                        <Zap className="w-4 h-4 text-success" />
                    </div>
                    <h3 className="text-sm font-bold font-display text-foreground">Anomaly Detection</h3>
                </div>
                <div className="flex items-center justify-center py-6">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-2xl bg-mint mx-auto flex items-center justify-center mb-3">
                            <span className="text-lg">✅</span>
                        </div>
                        <p className="text-sm font-medium text-foreground">No Anomalies</p>
                        <p className="text-xs text-muted-foreground mt-1">All readings within expected statistical range</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="soft-card p-5 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-peach flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-peach-foreground" />
                    </div>
                    <h3 className="text-sm font-bold font-display text-foreground">Anomaly Detection</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold">
                    {anomalies.length} FOUND
                </span>
            </div>

            <div className="space-y-2">
                {anomalies.map(anomaly => {
                    const Icon = typeIcons[anomaly.type] || Zap;
                    return (
                        <div
                            key={anomaly.id}
                            className={`rounded-2xl p-3.5 flex items-center gap-3 transition-all ${severityColors[anomaly.severity]} ${severityRing[anomaly.severity]}`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-card/50 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold truncate">{anomaly.vital}</p>
                                    <span className="px-2 py-0.5 rounded-full bg-card/50 text-[10px] font-bold uppercase">
                                        {anomaly.type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs font-mono font-bold">{anomaly.value}</span>
                                    <span className="text-[10px] opacity-70">z-score: {anomaly.zScore}</span>
                                    <span className="text-[10px] opacity-70">{Math.round(anomaly.confidence * 100)}% conf.</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <p className="text-[10px] text-muted-foreground/50 font-mono">
                Statistical analysis · Z-score + IQR method
            </p>
        </div>
    );
}
