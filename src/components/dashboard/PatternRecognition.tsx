import { ClinicalPattern } from '@/lib/mlEngine';
import { Activity, AlertTriangle, Stethoscope } from 'lucide-react';

interface Props {
    patterns: ClinicalPattern[];
}

export default function PatternRecognition({ patterns }: Props) {
    if (patterns.length === 0) {
        return (
            <div className="soft-card p-5 space-y-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-lavender flex items-center justify-center">
                        <Activity className="w-4 h-4 text-lavender-foreground" />
                    </div>
                    <h3 className="text-sm font-bold font-display text-foreground">Pattern Recognition</h3>
                </div>
                <div className="flex items-center justify-center py-6">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-2xl bg-mint mx-auto flex items-center justify-center mb-3">
                            <span className="text-lg">🔍</span>
                        </div>
                        <p className="text-sm font-medium text-foreground">No Patterns Detected</p>
                        <p className="text-xs text-muted-foreground mt-1">Multi-vital correlation analysis is active</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="soft-card p-5 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-lavender flex items-center justify-center">
                        <Activity className="w-4 h-4 text-lavender-foreground" />
                    </div>
                    <h3 className="text-sm font-bold font-display text-foreground">Pattern Recognition</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${patterns.some(p => p.severity === 'critical')
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-warning/15 text-warning'
                    }`}>
                    {patterns.length} DETECTED
                </span>
            </div>

            <div className="space-y-2.5">
                {patterns.map(pattern => (
                    <div
                        key={pattern.id}
                        className={`rounded-2xl p-4 space-y-2.5 ${pattern.severity === 'critical'
                                ? 'bg-destructive/5 ring-1 ring-destructive/20'
                                : 'bg-warning/5 ring-1 ring-warning/20'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${pattern.severity === 'critical' ? 'bg-destructive/10' : 'bg-warning/10'
                                }`}>
                                {pattern.severity === 'critical'
                                    ? <AlertTriangle className="w-5 h-5 text-destructive" />
                                    : <Stethoscope className="w-5 h-5 text-warning" />
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-foreground">{pattern.name}</p>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${pattern.severity === 'critical'
                                            ? 'bg-destructive/10 text-destructive'
                                            : 'bg-warning/10 text-warning'
                                        }`}>
                                        {pattern.severity}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    {pattern.description}
                                </p>
                            </div>
                        </div>

                        {/* Involved vitals */}
                        <div className="flex flex-wrap gap-1.5">
                            {pattern.involvedVitals.map(vital => (
                                <span
                                    key={vital}
                                    className="px-2 py-0.5 rounded-lg bg-card/50 text-[10px] font-medium text-foreground/70"
                                >
                                    {vital}
                                </span>
                            ))}
                        </div>

                        {/* Recommendation */}
                        <div className="bg-card/50 rounded-xl p-3">
                            <p className="text-[10px] font-semibold text-foreground/70 mb-1">💡 Recommendation</p>
                            <p className="text-xs text-foreground/80">{pattern.recommendation}</p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
                            <span className="font-mono">{Math.round(pattern.confidence * 100)}% confidence</span>
                            <span>{new Date(pattern.detectedAt).toLocaleTimeString()}</span>
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-[10px] text-muted-foreground/50 font-mono">
                Multi-vital correlation · Rules-based detection
            </p>
        </div>
    );
}
