// ML Engine — Client-side statistical ML for patient vitals analysis
// Implements: Anomaly Detection (Z-score + IQR), Linear Regression Prediction,
// Multi-vital Pattern Recognition, and ML-enhanced Risk Scoring

export interface AnomalyEvent {
    id: string;
    vital: string;
    vitalKey: string;
    value: number;
    expectedRange: [number, number];
    zScore: number;
    type: 'spike' | 'drop' | 'outlier';
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    timestamp: number;
}

export interface MLPrediction {
    vitalKey: string;
    vitalLabel: string;
    currentValue: number;
    predictedValues: number[];
    trend: 'rising' | 'falling' | 'stable';
    slope: number;
    rSquared: number;
    willBreachThreshold: boolean;
    breachTimeSteps: number | null;
    breachDirection: 'high' | 'low' | null;
    confidence: number;
}

export interface ClinicalPattern {
    id: string;
    name: string;
    description: string;
    severity: 'warning' | 'critical';
    involvedVitals: string[];
    confidence: number;
    detectedAt: number;
    recommendation: string;
}

export interface MLInsight {
    id: string;
    text: string;
    category: 'anomaly' | 'trend' | 'pattern' | 'recommendation';
    severity: 'info' | 'warning' | 'critical';
    confidence: number;
    timestamp: number;
}

interface VitalHistory {
    values: number[];
    timestamps: number[];
}

// =================== STATISTICAL HELPERS ===================

function mean(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function stdDev(arr: number[]): number {
    if (arr.length < 2) return 0;
    const m = mean(arr);
    const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1);
    return Math.sqrt(variance);
}

function percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (idx - lower) * (sorted[upper] - sorted[lower]);
}

function linearRegression(values: number[]): { slope: number; intercept: number; rSquared: number } {
    const n = values.length;
    if (n < 2) return { slope: 0, intercept: values[0] || 0, rSquared: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += values[i];
        sumXY += i * values[i];
        sumX2 += i * i;
        sumY2 += values[i] * values[i];
    }

    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return { slope: 0, intercept: mean(values), rSquared: 0 };

    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;

    // R-squared
    const yMean = sumY / n;
    const ssTotal = sumY2 - n * yMean * yMean;
    const ssResidual = values.reduce((s, v, i) => {
        const predicted = intercept + slope * i;
        return s + (v - predicted) ** 2;
    }, 0);
    const rSquared = ssTotal === 0 ? 0 : Math.max(0, 1 - ssResidual / ssTotal);

    return { slope, intercept, rSquared };
}

// =================== ANOMALY DETECTION ===================

const VITAL_LABELS: Record<string, string> = {
    heartRate: 'Heart Rate',
    systolic: 'Blood Pressure (Sys)',
    diastolic: 'Blood Pressure (Dia)',
    spo2: 'SpO2',
    temperature: 'Temperature',
    respRate: 'Resp. Rate',
};

const NORMAL_RANGES: Record<string, [number, number]> = {
    heartRate: [60, 100],
    systolic: [90, 140],
    diastolic: [60, 90],
    spo2: [95, 100],
    temperature: [97, 99.5],
    respRate: [12, 20],
};

export function detectAnomalies(
    histories: Record<string, VitalHistory>
): AnomalyEvent[] {
    const anomalies: AnomalyEvent[] = [];

    for (const [key, history] of Object.entries(histories)) {
        if (history.values.length < 5) continue;

        const values = history.values;
        const m = mean(values);
        const sd = stdDev(values);
        const q1 = percentile(values, 25);
        const q3 = percentile(values, 75);
        const iqr = q3 - q1;
        const iqrLower = q1 - 1.5 * iqr;
        const iqrUpper = q3 + 1.5 * iqr;

        // Check latest value
        const latest = values[values.length - 1];
        const latestTimestamp = history.timestamps[history.timestamps.length - 1];
        const zScore = sd > 0 ? Math.abs((latest - m) / sd) : 0;
        const isIQROutlier = latest < iqrLower || latest > iqrUpper;
        const normalRange = NORMAL_RANGES[key];

        if (zScore > 1.8 || isIQROutlier) {
            const type = latest > m ? 'spike' : latest < m ? 'drop' : 'outlier';
            const severity = zScore > 3 ? 'critical' : zScore > 2.5 ? 'high' : zScore > 2 ? 'medium' : 'low';
            const confidence = Math.min(0.99, 0.5 + zScore * 0.15);

            anomalies.push({
                id: `anomaly-${key}-${latestTimestamp}`,
                vital: VITAL_LABELS[key] || key,
                vitalKey: key,
                value: latest,
                expectedRange: normalRange || [m - sd, m + sd],
                zScore: parseFloat(zScore.toFixed(2)),
                type,
                severity,
                confidence: parseFloat(confidence.toFixed(2)),
                timestamp: latestTimestamp,
            });
        }
    }

    return anomalies;
}

// =================== TREND PREDICTION ===================

export function predictTrends(
    histories: Record<string, VitalHistory>,
    stepsAhead: number = 5
): MLPrediction[] {
    const predictions: MLPrediction[] = [];

    for (const [key, history] of Object.entries(histories)) {
        if (history.values.length < 5) continue;

        // Use last 15 values for regression (or whatever's available)
        const window = history.values.slice(-15);
        const { slope, intercept, rSquared } = linearRegression(window);

        // Predict future values
        const n = window.length;
        const predictedValues = Array.from({ length: stepsAhead }, (_, i) =>
            parseFloat((intercept + slope * (n + i)).toFixed(2))
        );

        // Check if prediction crosses thresholds
        const normalRange = NORMAL_RANGES[key];
        let willBreach = false;
        let breachStep: number | null = null;
        let breachDir: 'high' | 'low' | null = null;

        if (normalRange) {
            for (let i = 0; i < predictedValues.length; i++) {
                if (predictedValues[i] > normalRange[1] * 1.1) {
                    willBreach = true;
                    breachStep = i + 1;
                    breachDir = 'high';
                    break;
                }
                if (predictedValues[i] < normalRange[0] * 0.9) {
                    willBreach = true;
                    breachStep = i + 1;
                    breachDir = 'low';
                    break;
                }
            }
        }

        const trend = Math.abs(slope) < 0.3 ? 'stable' : slope > 0 ? 'rising' : 'falling';
        const confidence = Math.min(0.95, rSquared * 0.7 + 0.25);

        predictions.push({
            vitalKey: key,
            vitalLabel: VITAL_LABELS[key] || key,
            currentValue: history.values[history.values.length - 1],
            predictedValues,
            trend,
            slope: parseFloat(slope.toFixed(3)),
            rSquared: parseFloat(rSquared.toFixed(3)),
            willBreachThreshold: willBreach,
            breachTimeSteps: breachStep,
            breachDirection: breachDir,
            confidence: parseFloat(confidence.toFixed(2)),
        });
    }

    return predictions;
}

// =================== PATTERN RECOGNITION ===================

export function detectPatterns(
    histories: Record<string, VitalHistory>
): ClinicalPattern[] {
    const patterns: ClinicalPattern[] = [];
    const now = Date.now();

    // Need sufficient data
    const hasData = (key: string) => histories[key] && histories[key].values.length >= 8;

    // Pattern 1: Sepsis indicator — Rising HR + Rising Temp + Rising Resp Rate
    if (hasData('heartRate') && hasData('temperature') && hasData('respRate')) {
        const hrTrend = linearRegression(histories.heartRate.values.slice(-10)).slope;
        const tempTrend = linearRegression(histories.temperature.values.slice(-10)).slope;
        const rrTrend = linearRegression(histories.respRate.values.slice(-10)).slope;

        if (hrTrend > 0.5 && tempTrend > 0.02 && rrTrend > 0.3) {
            patterns.push({
                id: `pattern-sepsis-${now}`,
                name: 'Possible Sepsis Onset',
                description: 'Simultaneous rising heart rate, temperature, and respiratory rate detected — consistent with early sepsis indicators.',
                severity: 'critical',
                involvedVitals: ['Heart Rate', 'Temperature', 'Resp. Rate'],
                confidence: 0.72,
                detectedAt: now,
                recommendation: 'Initiate sepsis screening protocol. Consider blood cultures and lactate levels.',
            });
        }
    }

    // Pattern 2: Respiratory distress — Falling SpO2 + Rising Resp Rate
    if (hasData('spo2') && hasData('respRate')) {
        const spo2Trend = linearRegression(histories.spo2.values.slice(-10)).slope;
        const rrTrend = linearRegression(histories.respRate.values.slice(-10)).slope;
        const latestSpo2 = histories.spo2.values[histories.spo2.values.length - 1];

        if (spo2Trend < -0.1 && rrTrend > 0.2 && latestSpo2 < 96) {
            patterns.push({
                id: `pattern-respiratory-${now}`,
                name: 'Respiratory Distress',
                description: 'Declining oxygen saturation with compensatory increase in respiratory rate detected.',
                severity: 'critical',
                involvedVitals: ['SpO2', 'Resp. Rate'],
                confidence: 0.78,
                detectedAt: now,
                recommendation: 'Assess airway and breathing. Consider supplemental oxygen or ventilation support.',
            });
        }
    }

    // Pattern 3: Cardiac stress — Rising HR + Rising BP
    if (hasData('heartRate') && hasData('systolic')) {
        const hrTrend = linearRegression(histories.heartRate.values.slice(-10)).slope;
        const bpTrend = linearRegression(histories.systolic.values.slice(-10)).slope;
        const latestHR = histories.heartRate.values[histories.heartRate.values.length - 1];

        if (hrTrend > 0.8 && bpTrend > 0.5 && latestHR > 95) {
            patterns.push({
                id: `pattern-cardiac-${now}`,
                name: 'Cardiac Stress',
                description: 'Concurrent elevation in heart rate and blood pressure suggesting increased cardiac workload.',
                severity: 'warning',
                involvedVitals: ['Heart Rate', 'Blood Pressure'],
                confidence: 0.65,
                detectedAt: now,
                recommendation: 'Monitor closely. Consider 12-lead ECG if symptoms persist.',
            });
        }
    }

    // Pattern 4: Hemodynamic instability — Falling BP + Rising HR
    if (hasData('systolic') && hasData('heartRate')) {
        const bpTrend = linearRegression(histories.systolic.values.slice(-10)).slope;
        const hrTrend = linearRegression(histories.heartRate.values.slice(-10)).slope;
        const latestBP = histories.systolic.values[histories.systolic.values.length - 1];

        if (bpTrend < -0.5 && hrTrend > 0.5 && latestBP < 100) {
            patterns.push({
                id: `pattern-hemodynamic-${now}`,
                name: 'Hemodynamic Instability',
                description: 'Declining blood pressure with compensatory tachycardia — possible hypovolemia or shock.',
                severity: 'critical',
                involvedVitals: ['Blood Pressure', 'Heart Rate'],
                confidence: 0.74,
                detectedAt: now,
                recommendation: 'Assess fluid status. Consider IV fluid bolus and vasopressor readiness.',
            });
        }
    }

    // Pattern 5: Hypothermia risk — Falling temperature
    if (hasData('temperature')) {
        const tempTrend = linearRegression(histories.temperature.values.slice(-10)).slope;
        const latestTemp = histories.temperature.values[histories.temperature.values.length - 1];

        if (tempTrend < -0.05 && latestTemp < 97.5) {
            patterns.push({
                id: `pattern-hypothermia-${now}`,
                name: 'Hypothermia Risk',
                description: 'Declining body temperature trending toward hypothermia range.',
                severity: 'warning',
                involvedVitals: ['Temperature'],
                confidence: 0.6,
                detectedAt: now,
                recommendation: 'Apply warming measures. Monitor core temperature closely.',
            });
        }
    }

    return patterns;
}

// =================== ML RISK SCORING ===================

export function computeMLRiskScore(
    histories: Record<string, VitalHistory>,
    anomalies: AnomalyEvent[],
    predictions: MLPrediction[],
    patterns: ClinicalPattern[]
): number {
    let score = 0;

    // 1. Anomaly contribution (0-30)
    for (const anomaly of anomalies) {
        const severityWeight = { low: 3, medium: 8, high: 15, critical: 25 };
        score += severityWeight[anomaly.severity] * anomaly.confidence;
    }
    score = Math.min(30, score);

    // 2. Prediction breach contribution (0-25)
    let predictionScore = 0;
    for (const pred of predictions) {
        if (pred.willBreachThreshold) {
            const urgency = pred.breachTimeSteps ? (6 - pred.breachTimeSteps) * 5 : 10;
            predictionScore += Math.max(0, urgency) * pred.confidence;
        }
        // Unfavorable trends
        if (pred.trend !== 'stable' && Math.abs(pred.slope) > 0.5) {
            predictionScore += 3;
        }
    }
    score += Math.min(25, predictionScore);

    // 3. Pattern contribution (0-30)
    for (const pattern of patterns) {
        const patternWeight = pattern.severity === 'critical' ? 20 : 10;
        score += patternWeight * pattern.confidence;
    }
    score = Math.min(85, score);

    // 4. Base vital deviation (0-15)
    for (const [key, history] of Object.entries(histories)) {
        if (history.values.length === 0) continue;
        const latest = history.values[history.values.length - 1];
        const normalRange = NORMAL_RANGES[key];
        if (normalRange) {
            const mid = (normalRange[0] + normalRange[1]) / 2;
            const spread = (normalRange[1] - normalRange[0]) / 2;
            const deviation = Math.abs(latest - mid) / spread;
            if (deviation > 1) score += Math.min(3, (deviation - 1) * 2);
        }
    }

    return Math.min(100, Math.round(score));
}

// =================== INSIGHT GENERATION ===================

export function generateInsights(
    anomalies: AnomalyEvent[],
    predictions: MLPrediction[],
    patterns: ClinicalPattern[]
): MLInsight[] {
    const insights: MLInsight[] = [];
    const now = Date.now();

    // Anomaly insights
    for (const anomaly of anomalies) {
        insights.push({
            id: `insight-anomaly-${anomaly.id}`,
            text: `${anomaly.type === 'spike' ? '📈 Abnormal spike' : anomaly.type === 'drop' ? '📉 Abnormal drop' : '⚠️ Outlier'} detected in ${anomaly.vital}: ${anomaly.value} (z-score: ${anomaly.zScore}). Expected range: ${anomaly.expectedRange[0].toFixed(1)}–${anomaly.expectedRange[1].toFixed(1)}.`,
            category: 'anomaly',
            severity: anomaly.severity === 'critical' || anomaly.severity === 'high' ? 'critical' : 'warning',
            confidence: anomaly.confidence,
            timestamp: now,
        });
    }

    // Prediction insights
    for (const pred of predictions) {
        if (pred.willBreachThreshold && pred.breachTimeSteps) {
            const minutes = pred.breachTimeSteps * 2.5; // each step is ~2.5s interval
            insights.push({
                id: `insight-prediction-${pred.vitalKey}`,
                text: `🔮 ${pred.vitalLabel} predicted to breach ${pred.breachDirection} threshold in ~${Math.ceil(minutes / 60)} min at current trend (slope: ${pred.slope > 0 ? '+' : ''}${pred.slope}).`,
                category: 'trend',
                severity: 'warning',
                confidence: pred.confidence,
                timestamp: now,
            });
        }
    }

    // Pattern insights
    for (const pattern of patterns) {
        insights.push({
            id: `insight-pattern-${pattern.id}`,
            text: `🧬 ${pattern.name}: ${pattern.description}`,
            category: 'pattern',
            severity: pattern.severity === 'critical' ? 'critical' : 'warning',
            confidence: pattern.confidence,
            timestamp: now,
        });

        insights.push({
            id: `insight-rec-${pattern.id}`,
            text: `💡 Recommended: ${pattern.recommendation}`,
            category: 'recommendation',
            severity: 'info',
            confidence: pattern.confidence,
            timestamp: now,
        });
    }

    // General stability insight
    if (anomalies.length === 0 && patterns.length === 0) {
        insights.push({
            id: `insight-stable-${now}`,
            text: '✅ All vitals within expected ranges. No anomalies or concerning patterns detected.',
            category: 'recommendation',
            severity: 'info',
            confidence: 0.9,
            timestamp: now,
        });
    }

    return insights;
}
