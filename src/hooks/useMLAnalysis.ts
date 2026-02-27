import { useMemo } from 'react';
import type { Vitals } from '@/lib/mockData';
import {
    detectAnomalies,
    predictTrends,
    detectPatterns,
    computeMLRiskScore,
    generateInsights,
    type AnomalyEvent,
    type MLPrediction,
    type ClinicalPattern,
    type MLInsight,
} from '@/lib/mlEngine';

interface VitalHistory {
    values: number[];
    timestamps: number[];
}

export interface MLAnalysisResult {
    anomalies: AnomalyEvent[];
    predictions: MLPrediction[];
    patterns: ClinicalPattern[];
    mlRiskScore: number;
    insights: MLInsight[];
}

export function useMLAnalysis(
    history: Record<keyof Vitals, { timestamp: number; value: number }[]>
): MLAnalysisResult {
    const formattedHistory = useMemo(() => {
        const result: Record<string, VitalHistory> = {};
        for (const [key, readings] of Object.entries(history)) {
            result[key] = {
                values: readings.map(r => r.value),
                timestamps: readings.map(r => r.timestamp),
            };
        }
        return result;
    }, [history]);

    const anomalies = useMemo(() => detectAnomalies(formattedHistory), [formattedHistory]);
    const predictions = useMemo(() => predictTrends(formattedHistory), [formattedHistory]);
    const patterns = useMemo(() => detectPatterns(formattedHistory), [formattedHistory]);
    const mlRiskScore = useMemo(
        () => computeMLRiskScore(formattedHistory, anomalies, predictions, patterns),
        [formattedHistory, anomalies, predictions, patterns]
    );
    const insights = useMemo(
        () => generateInsights(anomalies, predictions, patterns),
        [anomalies, predictions, patterns]
    );

    return { anomalies, predictions, patterns, mlRiskScore, insights };
}
