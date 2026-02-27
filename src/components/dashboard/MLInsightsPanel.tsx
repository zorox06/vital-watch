import { MLInsight } from '@/lib/mlEngine';
import { Brain, AlertCircle, TrendingUp, Dna, Lightbulb } from 'lucide-react';

interface Props {
    insights: MLInsight[];
    mlRiskScore: number;
}

const categoryIcons: Record<string, React.ElementType> = {
    anomaly: AlertCircle,
    trend: TrendingUp,
    pattern: Dna,
    recommendation: Lightbulb,
};

const categoryColors: Record<string, string> = {
    anomaly: 'bg-peach',
    trend: 'bg-sky',
    pattern: 'bg-lavender',
    recommendation: 'bg-mint',
};

const severityStyles: Record<string, string> = {
    info: 'border-l-primary',
    warning: 'border-l-warning',
    critical: 'border-l-destructive',
};

export default function MLInsightsPanel({ insights, mlRiskScore }: Props) {
    return (
        <div className="soft-card p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold font-display text-foreground">AI Insights</h3>
                        <p className="text-[10px] text-muted-foreground">ML-generated analysis</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${mlRiskScore >= 60 ? 'bg-destructive/10 text-destructive' :
                            mlRiskScore >= 30 ? 'bg-warning/15 text-warning' :
                                'bg-mint text-success'
                        }`}>
                        Risk: {mlRiskScore}
                    </div>
                </div>
            </div>

            {insights.length === 0 ? (
                <div className="flex items-center justify-center py-6">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-3">
                            <span className="text-lg">🧠</span>
                        </div>
                        <p className="text-sm font-medium text-foreground">Analyzing...</p>
                        <p className="text-xs text-muted-foreground mt-1">Collecting data for ML analysis</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    {insights.map(insight => {
                        const Icon = categoryIcons[insight.category] || Lightbulb;
                        return (
                            <div
                                key={insight.id}
                                className={`rounded-xl p-3 border-l-3 bg-muted/30 ${severityStyles[insight.severity]}`}
                                style={{ borderLeftWidth: '3px' }}
                            >
                                <div className="flex items-start gap-2.5">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${categoryColors[insight.category]}`}>
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-foreground/90 leading-relaxed">{insight.text}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[9px] text-muted-foreground/60 font-mono">
                                                {Math.round(insight.confidence * 100)}% conf.
                                            </span>
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase font-bold">
                                                {insight.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <p className="text-[10px] text-muted-foreground/50 font-mono">
                Powered by VitalWatch ML Engine · Real-time analysis
            </p>
        </div>
    );
}
