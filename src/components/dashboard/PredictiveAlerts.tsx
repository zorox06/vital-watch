import { MLPrediction } from '@/lib/mlEngine';
import { TrendingUp, TrendingDown, Minus, Clock, AlertTriangle } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Props {
    predictions: MLPrediction[];
}

const trendIcons = {
    rising: TrendingUp,
    falling: TrendingDown,
    stable: Minus,
};

const trendColors = {
    rising: 'text-destructive',
    falling: 'text-sky-foreground',
    stable: 'text-success',
};

export default function PredictiveAlerts({ predictions }: Props) {
    const criticalPredictions = predictions.filter(p => p.willBreachThreshold);
    const hasDanger = criticalPredictions.length > 0;

    return (
        <div className="soft-card p-5 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl ${hasDanger ? 'bg-peach' : 'bg-sky'} flex items-center justify-center`}>
                        <Clock className={`w-4 h-4 ${hasDanger ? 'text-peach-foreground' : 'text-sky-foreground'}`} />
                    </div>
                    <h3 className="text-sm font-bold font-display text-foreground">Predictive Alerts</h3>
                </div>
                {hasDanger && (
                    <span className="px-2.5 py-1 rounded-full bg-warning/15 text-warning text-[10px] font-bold animate-pulse">
                        {criticalPredictions.length} AT RISK
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2">
                {predictions.slice(0, 6).map(pred => {
                    const TrendIcon = trendIcons[pred.trend];
                    const trendColor = trendColors[pred.trend];

                    // Build chart data: historical value + predicted values
                    const chartData = [
                        { idx: 0, value: pred.currentValue, predicted: null as number | null },
                        ...pred.predictedValues.map((v, i) => ({
                            idx: i + 1,
                            value: null as number | null,
                            predicted: v,
                        })),
                    ];

                    return (
                        <div
                            key={pred.vitalKey}
                            className={`rounded-2xl p-3 transition-all ${pred.willBreachThreshold
                                    ? 'bg-destructive/5 ring-1 ring-destructive/20'
                                    : 'bg-muted/50'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-semibold text-foreground/70">{pred.vitalLabel}</span>
                                <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
                            </div>

                            {/* Mini forecast chart */}
                            <div className="h-10 -mx-1 mb-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id={`pred-grad-${pred.vitalKey}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={pred.willBreachThreshold ? 'hsl(0, 72%, 58%)' : 'hsl(200, 65%, 50%)'} stopOpacity={0.2} />
                                                <stop offset="100%" stopColor={pred.willBreachThreshold ? 'hsl(0, 72%, 58%)' : 'hsl(200, 65%, 50%)'} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="hsl(160, 55%, 42%)"
                                            strokeWidth={2}
                                            fill="none"
                                            dot={false}
                                            isAnimationActive={false}
                                            connectNulls={false}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="predicted"
                                            stroke={pred.willBreachThreshold ? 'hsl(0, 72%, 58%)' : 'hsl(200, 65%, 50%)'}
                                            strokeWidth={2}
                                            strokeDasharray="4 3"
                                            fill={`url(#pred-grad-${pred.vitalKey})`}
                                            dot={false}
                                            isAnimationActive={false}
                                            connectNulls={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold font-display text-foreground">
                                    {pred.currentValue}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                    →{' '}{pred.predictedValues[pred.predictedValues.length - 1]}
                                </span>
                            </div>

                            {pred.willBreachThreshold && pred.breachTimeSteps && (
                                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-destructive font-medium">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Risk in ~{pred.breachTimeSteps} steps</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-1">
                                <span className="text-[9px] text-muted-foreground/50 font-mono">
                                    R²={pred.rSquared}
                                </span>
                                <span className="text-[9px] text-muted-foreground/50">
                                    {Math.round(pred.confidence * 100)}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <p className="text-[10px] text-muted-foreground/50 font-mono">
                Linear regression · Sliding window prediction
            </p>
        </div>
    );
}
