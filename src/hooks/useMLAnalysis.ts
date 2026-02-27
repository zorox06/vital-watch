import { useMemo } from 'react';
import type { Vitals } from '@/lib/mockData';
import {
    detectAnomalies,
    predictTrends,
    detectPatterns,
    computeMLRiskScore,
    generateInsights,
    computeNEWS2,
    predictDeteriorationProb,
    type AnomalyEvent,
    type MLPrediction,
    type ClinicalPattern,
    type MLInsight,
    type NEWS2Scores,
    type VitalHistory,
} from '@/lib/mlEngine';

export interface MLAnalysisResult {
    anomalies: AnomalyEvent[];
    predictions: MLPrediction[];
    patterns: ClinicalPattern[];
    mlRiskScore: number;
    insights: MLInsight[];
    news2: NEWS2Scores;
    deteriorationProb: number;
    serverConnected: boolean;
}

export function useMLAnalysis(
    history: Record<keyof Vitals, { timestamp: number; value: number }[]>
): MLAnalysisResult {

    // Create a stable hash to detect actual data changes
    const latestHash = useMemo(() => {
        const parts: string[] = [];
        for (const [key, readings] of Object.entries(history)) {
            if (readings.length > 0) {
                const last = readings[readings.length - 1];
                parts.push(`${key}:${last.value}:${readings.length}`);
            }
        }
        return parts.join('|');
    }, [history]);

    // Format history for ML engine
    const formattedHistory = useMemo(() => {
        const result: Record<string, VitalHistory> = {};
        for (const [key, readings] of Object.entries(history)) {
            result[key] = {
                values: readings.map(r => r.value),
                timestamps: readings.map(r => r.timestamp),
            };
        }
        return result;
    }, [latestHash]); // eslint-disable-line react-hooks/exhaustive-deps

    // Extract latest vitals
    const latestVitals = useMemo(() => {
        const vitals: Record<string, number> = {};
        for (const [key, readings] of Object.entries(history)) {
            if (readings.length > 0) {
                vitals[key] = readings[readings.length - 1].value;
            }
        }
        return vitals;
    }, [latestHash]); // eslint-disable-line react-hooks/exhaustive-deps

    // Run ML pipeline (all in-browser)
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

    const news2 = useMemo(() => computeNEWS2(latestVitals), [latestVitals]);
    const deteriorationProb = useMemo(() => predictDeteriorationProb(latestVitals), [latestVitals]);

    return {
        anomalies,
        predictions,
        patterns,
        mlRiskScore,
        insights,
        news2,
        deteriorationProb,
        serverConnected: false, // No server — all on-device
    };
}
