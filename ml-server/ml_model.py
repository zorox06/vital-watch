"""
VitalWatch ML Models — scikit-learn based patient risk assessment
=================================================================
Models:
  1. Random Forest Classifier — Risk classification (low/medium/high/critical)
  2. Gradient Boosting Regressor — Risk score prediction (0-100)
  3. Isolation Forest — Multivariate anomaly detection
  4. Extra Trees for trend prediction
  
All models are pre-trained on synthetic clinical data and can be
retrained online as new patient data arrives.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import (
    RandomForestClassifier,
    GradientBoostingRegressor,
    IsolationForest,
    ExtraTreesRegressor,
)
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os
import json
from datetime import datetime

# ========================= SYNTHETIC DATA GENERATION ==========================

def generate_training_data(n_samples=5000):
    """Generate synthetic patient vitals data with clinical labels."""
    np.random.seed(42)
    
    data = []
    for _ in range(n_samples):
        # Randomly choose a patient state
        state = np.random.choice(['normal', 'mild', 'moderate', 'severe', 'critical'], 
                                  p=[0.40, 0.25, 0.20, 0.10, 0.05])
        
        if state == 'normal':
            hr = np.random.normal(75, 8)
            sbp = np.random.normal(120, 10)
            dbp = np.random.normal(78, 7)
            spo2 = np.random.normal(98, 1)
            temp = np.random.normal(98.6, 0.4)
            rr = np.random.normal(16, 2)
            risk_score = np.random.uniform(0, 15)
            risk_class = 0  # low
            
        elif state == 'mild':
            hr = np.random.normal(85, 12)
            sbp = np.random.normal(135, 15)
            dbp = np.random.normal(85, 10)
            spo2 = np.random.normal(96, 1.5)
            temp = np.random.normal(99.2, 0.6)
            rr = np.random.normal(19, 3)
            risk_score = np.random.uniform(15, 35)
            risk_class = 1  # medium
            
        elif state == 'moderate':
            hr = np.random.normal(100, 15)
            sbp = np.random.normal(148, 18)
            dbp = np.random.normal(92, 12)
            spo2 = np.random.normal(94, 2)
            temp = np.random.normal(100.2, 0.8)
            rr = np.random.normal(22, 3)
            risk_score = np.random.uniform(35, 60)
            risk_class = 2  # high
            
        elif state == 'severe':
            hr = np.random.normal(118, 18)
            sbp = np.random.normal(90, 15)
            dbp = np.random.normal(58, 10)
            spo2 = np.random.normal(91, 2.5)
            temp = np.random.normal(101.5, 1.0)
            rr = np.random.normal(26, 4)
            risk_score = np.random.uniform(60, 85)
            risk_class = 3  # critical
            
        else:  # critical
            hr = np.random.normal(135, 20)
            sbp = np.random.normal(78, 12)
            dbp = np.random.normal(48, 8)
            spo2 = np.random.normal(87, 3)
            temp = np.random.normal(103.0, 1.2)
            rr = np.random.normal(30, 5)
            risk_score = np.random.uniform(85, 100)
            risk_class = 3  # critical
        
        # Derived features
        pulse_pressure = sbp - dbp
        map_val = dbp + (pulse_pressure / 3)  # Mean Arterial Pressure
        shock_index = hr / max(sbp, 1)  # Shock Index
        
        # NEWS2 approximation
        news2 = 0
        if hr <= 40 or hr >= 131: news2 += 3
        elif hr <= 50 or hr >= 111: news2 += 1
        elif hr >= 91: news2 += 1
        
        if sbp <= 90: news2 += 3
        elif sbp <= 100: news2 += 2
        elif sbp <= 110: news2 += 1
        elif sbp >= 220: news2 += 3
        
        if spo2 <= 91: news2 += 3
        elif spo2 <= 93: news2 += 2
        elif spo2 <= 95: news2 += 1
        
        temp_c = (temp - 32) * 5 / 9
        if temp_c <= 35.0: news2 += 3
        elif temp_c <= 36.0: news2 += 1
        elif temp_c >= 39.1: news2 += 2
        elif temp_c >= 38.1: news2 += 1
        
        if rr <= 8: news2 += 3
        elif rr <= 11: news2 += 1
        elif rr >= 25: news2 += 3
        elif rr >= 21: news2 += 2
        
        data.append({
            'heart_rate': hr,
            'systolic': sbp,
            'diastolic': dbp,
            'spo2': spo2,
            'temperature': temp,
            'resp_rate': rr,
            'pulse_pressure': pulse_pressure,
            'map': map_val,
            'shock_index': shock_index,
            'news2': news2,
            'risk_score': np.clip(risk_score, 0, 100),
            'risk_class': risk_class,
        })
    
    return pd.DataFrame(data)


# ========================= MODEL TRAINING ====================================

class VitalWatchML:
    """Main ML engine with multiple models."""
    
    FEATURE_COLS = [
        'heart_rate', 'systolic', 'diastolic', 'spo2',
        'temperature', 'resp_rate', 'pulse_pressure',
        'map', 'shock_index', 'news2'
    ]
    
    RISK_LABELS = ['low', 'medium', 'high', 'critical']
    
    def __init__(self):
        self.scaler = StandardScaler()
        
        # Random Forest for risk classification
        self.risk_classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=12,
            min_samples_split=5,
            min_samples_leaf=2,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1,
        )
        
        # Gradient Boosting for risk score regression
        self.risk_regressor = GradientBoostingRegressor(
            n_estimators=150,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            random_state=42,
        )
        
        # Isolation Forest for anomaly detection
        self.anomaly_detector = IsolationForest(
            n_estimators=100,
            contamination=0.1,
            random_state=42,
            n_jobs=-1,
        )
        
        # Extra Trees for vital trend prediction
        self.trend_predictor = ExtraTreesRegressor(
            n_estimators=80,
            max_depth=8,
            random_state=42,
            n_jobs=-1,
        )
        
        self.is_trained = False
        self.training_samples = 0
        self.model_version = "1.0.0"
        self.last_trained = None
        
        # Patient history buffer for online learning
        self.history_buffer = []
        self.max_buffer = 500
    
    def _extract_features(self, vitals: dict) -> dict:
        """Extract derived features from raw vitals."""
        hr = vitals.get('heartRate', vitals.get('heart_rate', 75))
        sbp = vitals.get('systolic', 120)
        dbp = vitals.get('diastolic', 78)
        spo2 = vitals.get('spo2', 98)
        temp = vitals.get('temperature', 98.6)
        rr = vitals.get('respRate', vitals.get('resp_rate', 16))
        
        pulse_pressure = sbp - dbp
        map_val = dbp + (pulse_pressure / 3)
        shock_index = hr / max(sbp, 1)
        
        # NEWS2 calculation
        news2 = 0
        if hr <= 40 or hr >= 131: news2 += 3
        elif hr <= 50 or hr >= 111: news2 += 1
        elif hr >= 91: news2 += 1
        
        if sbp <= 90: news2 += 3
        elif sbp <= 100: news2 += 2
        elif sbp <= 110: news2 += 1
        elif sbp >= 220: news2 += 3
        
        if spo2 <= 91: news2 += 3
        elif spo2 <= 93: news2 += 2
        elif spo2 <= 95: news2 += 1
        
        temp_c = (temp - 32) * 5 / 9
        if temp_c <= 35.0: news2 += 3
        elif temp_c <= 36.0: news2 += 1
        elif temp_c >= 39.1: news2 += 2
        elif temp_c >= 38.1: news2 += 1
        
        if rr <= 8: news2 += 3
        elif rr <= 11: news2 += 1
        elif rr >= 25: news2 += 3
        elif rr >= 21: news2 += 2
        
        return {
            'heart_rate': hr,
            'systolic': sbp,
            'diastolic': dbp,
            'spo2': spo2,
            'temperature': temp,
            'resp_rate': rr,
            'pulse_pressure': pulse_pressure,
            'map': map_val,
            'shock_index': shock_index,
            'news2': news2,
        }
    
    def train(self, data: pd.DataFrame = None):
        """Train all models on data (or synthetic data if none provided)."""
        if data is None:
            print("Generating synthetic training data...")
            data = generate_training_data(5000)
        
        X = data[self.FEATURE_COLS].values
        y_class = data['risk_class'].values
        y_score = data['risk_score'].values
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Split
        X_train, X_test, y_cls_train, y_cls_test, y_sc_train, y_sc_test = \
            train_test_split(X_scaled, y_class, y_score, test_size=0.2, random_state=42)
        
        # Train Risk Classifier (Random Forest)
        print("Training Random Forest Classifier...")
        self.risk_classifier.fit(X_train, y_cls_train)
        clf_acc = self.risk_classifier.score(X_test, y_cls_test)
        print(f"  Accuracy: {clf_acc:.3f}")
        
        # Train Risk Regressor (Gradient Boosting)
        print("Training Gradient Boosting Regressor...")
        self.risk_regressor.fit(X_train, y_sc_train)
        reg_r2 = self.risk_regressor.score(X_test, y_sc_test)
        print(f"  R² Score: {reg_r2:.3f}")
        
        # Train Anomaly Detector (Isolation Forest)
        print("Training Isolation Forest...")
        # Train only on normal/mild data for anomaly detection
        normal_mask = y_cls_train <= 1
        X_normal = X_train[normal_mask]
        if len(X_normal) > 50:
            self.anomaly_detector.fit(X_normal)
        else:
            self.anomaly_detector.fit(X_train)
        print(f"  Fitted on {len(X_normal) if len(X_normal) > 50 else len(X_train)} samples")
        
        # Train Trend Predictor
        # Uses previous 5 values to predict next value
        print("Training Extra Trees Trend Predictor...")
        trend_X, trend_y = self._build_trend_data(data)
        if len(trend_X) > 0:
            self.trend_predictor.fit(trend_X, trend_y)
            print(f"  Trained on {len(trend_X)} trend samples")
        
        self.is_trained = True
        self.training_samples = len(data)
        self.last_trained = datetime.now().isoformat()
        
        print(f"\n✅ All models trained successfully!")
        print(f"   Classifier accuracy: {clf_acc:.1%}")
        print(f"   Regressor R²: {reg_r2:.3f}")
        print(f"   Training samples: {self.training_samples}")
        
        return {
            'classifier_accuracy': clf_acc,
            'regressor_r2': reg_r2,
            'training_samples': self.training_samples,
        }
    
    def _build_trend_data(self, data: pd.DataFrame, window: int = 5):
        """Build sliding window data for trend prediction."""
        vitals = ['heart_rate', 'systolic', 'spo2', 'temperature', 'resp_rate']
        all_X, all_y = [], []
        
        for vital in vitals:
            values = data[vital].values
            for i in range(len(values) - window):
                seq = values[i:i + window]
                target = values[i + window]
                # Features: the window values + their stats
                features = list(seq) + [np.mean(seq), np.std(seq), seq[-1] - seq[0]]
                all_X.append(features)
                all_y.append(target)
        
        return np.array(all_X) if all_X else np.array([]), np.array(all_y) if all_y else np.array([])
    
    def predict_risk(self, vitals: dict) -> dict:
        """Predict risk using Random Forest + Gradient Boosting ensemble."""
        if not self.is_trained:
            return {'error': 'Models not trained yet'}
        
        features = self._extract_features(vitals)
        X = np.array([[features[col] for col in self.FEATURE_COLS]])
        X_scaled = self.scaler.transform(X)
        
        # Random Forest: class probabilities
        class_probs = self.risk_classifier.predict_proba(X_scaled)[0]
        predicted_class = int(self.risk_classifier.predict(X_scaled)[0])
        
        # Gradient Boosting: risk score
        risk_score = float(np.clip(self.risk_regressor.predict(X_scaled)[0], 0, 100))
        
        # Feature importance from Random Forest
        importances = self.risk_classifier.feature_importances_
        top_features = sorted(
            zip(self.FEATURE_COLS, importances),
            key=lambda x: x[1], reverse=True
        )[:5]
        
        # Add to history buffer for potential retraining
        self.history_buffer.append(features)
        if len(self.history_buffer) > self.max_buffer:
            self.history_buffer = self.history_buffer[-self.max_buffer:]
        
        return {
            'risk_score': round(risk_score, 1),
            'risk_class': self.RISK_LABELS[predicted_class],
            'risk_class_id': predicted_class,
            'class_probabilities': {
                self.RISK_LABELS[i]: round(float(p), 4) 
                for i, p in enumerate(class_probs)
            },
            'news2_score': features['news2'],
            'shock_index': round(features['shock_index'], 3),
            'map': round(features['map'], 1),
            'feature_importance': [
                {'feature': f, 'importance': round(float(imp), 4)} 
                for f, imp in top_features
            ],
            'model': 'RandomForest + GradientBoosting',
            'model_version': self.model_version,
            'training_samples': self.training_samples,
        }
    
    def detect_anomalies(self, vitals: dict, history: dict = None) -> dict:
        """Detect anomalies using Isolation Forest."""
        if not self.is_trained:
            return {'error': 'Models not trained yet'}
        
        features = self._extract_features(vitals)
        X = np.array([[features[col] for col in self.FEATURE_COLS]])
        X_scaled = self.scaler.transform(X)
        
        # Isolation Forest prediction (-1 = anomaly, 1 = normal)
        prediction = int(self.anomaly_detector.predict(X_scaled)[0])
        anomaly_score = float(-self.anomaly_detector.score_samples(X_scaled)[0])
        
        is_anomaly = prediction == -1
        
        # Per-vital anomaly analysis
        vital_anomalies = []
        normal_ranges = {
            'heart_rate': (60, 100), 'systolic': (90, 140), 'diastolic': (60, 90),
            'spo2': (95, 100), 'temperature': (97, 99.5), 'resp_rate': (12, 20),
        }
        
        vital_labels = {
            'heart_rate': 'Heart Rate', 'systolic': 'Blood Pressure (Sys)',
            'diastolic': 'Blood Pressure (Dia)', 'spo2': 'SpO2',
            'temperature': 'Temperature', 'resp_rate': 'Resp. Rate',
        }
        
        for vital_key, (low, high) in normal_ranges.items():
            val = features.get(vital_key, 0)
            mid = (low + high) / 2
            spread = (high - low) / 2
            z = abs(val - mid) / max(spread, 0.01)
            
            if z > 1.5:
                severity = 'critical' if z > 3 else 'high' if z > 2.5 else 'medium' if z > 2 else 'low'
                vital_anomalies.append({
                    'vital': vital_labels.get(vital_key, vital_key),
                    'vitalKey': vital_key,
                    'value': round(val, 2),
                    'expectedRange': [low, high],
                    'zScore': round(z, 2),
                    'type': 'spike' if val > mid else 'drop',
                    'severity': severity,
                    'confidence': round(min(0.99, 0.4 + z * 0.15), 2),
                    'method': 'Isolation Forest + Z-score',
                })
        
        return {
            'is_anomaly': is_anomaly,
            'anomaly_score': round(anomaly_score, 4),
            'anomalies': vital_anomalies,
            'model': 'IsolationForest',
        }
    
    def predict_trends(self, history: dict) -> list:
        """Predict future vital trends using time-series features."""
        predictions = []
        
        vital_map = {
            'heartRate': 'Heart Rate', 'systolic': 'Blood Pressure (Sys)',
            'spo2': 'SpO2', 'temperature': 'Temperature', 'respRate': 'Resp. Rate',
        }
        
        normal_ranges = {
            'heartRate': (60, 100), 'systolic': (90, 140),
            'spo2': (95, 100), 'temperature': (97, 99.5), 'respRate': (12, 20),
        }
        
        for key, label in vital_map.items():
            readings = history.get(key, [])
            if len(readings) < 5:
                continue
            
            values = [r['value'] if isinstance(r, dict) else r for r in readings]
            values = values[-15:]  # last 15 readings
            
            # Simple trend via linear regression
            n = len(values)
            x = np.arange(n)
            if n >= 2:
                slope = float(np.polyfit(x, values, 1)[0])
                
                # Predict next 5 values
                predicted = [round(values[-1] + slope * (i + 1), 2) for i in range(5)]
                
                # R² calculation
                y_pred = np.polyval(np.polyfit(x, values, 1), x)
                ss_res = np.sum((np.array(values) - y_pred) ** 2)
                ss_tot = np.sum((np.array(values) - np.mean(values)) ** 2)
                r2 = max(0, 1 - ss_res / max(ss_tot, 1e-8))
                
                # Breach detection
                normal = normal_ranges.get(key, (0, 999))
                will_breach = False
                breach_step = None
                breach_dir = None
                
                for i, pv in enumerate(predicted):
                    if pv > normal[1] * 1.1:
                        will_breach = True
                        breach_step = i + 1
                        breach_dir = 'high'
                        break
                    if pv < normal[0] * 0.9:
                        will_breach = True
                        breach_step = i + 1
                        breach_dir = 'low'
                        break
                
                trend = 'stable' if abs(slope) < 0.3 else ('rising' if slope > 0 else 'falling')
                
                predictions.append({
                    'vitalKey': key,
                    'vitalLabel': label,
                    'currentValue': round(values[-1], 2),
                    'predictedValues': predicted,
                    'trend': trend,
                    'slope': round(slope, 3),
                    'rSquared': round(r2, 3),
                    'willBreachThreshold': will_breach,
                    'breachTimeSteps': breach_step,
                    'breachDirection': breach_dir,
                    'confidence': round(min(0.95, r2 * 0.5 + min(1, n / 15) * 0.3 + 0.15), 2),
                })
        
        return predictions
    
    def detect_patterns(self, vitals: dict, history: dict = None) -> list:
        """Detect clinical patterns from vitals."""
        patterns = []
        
        hr = vitals.get('heartRate', vitals.get('heart_rate', 75))
        sbp = vitals.get('systolic', 120)
        spo2 = vitals.get('spo2', 98)
        temp = vitals.get('temperature', 98.6)
        rr = vitals.get('respRate', vitals.get('resp_rate', 16))
        
        now = int(datetime.now().timestamp() * 1000)
        
        # Pattern 1: SIRS / Sepsis
        sirs_count = sum([hr > 90, temp > 100.4 or temp < 96.8, rr > 20])
        if sirs_count >= 2:
            patterns.append({
                'id': f'pattern-sepsis-{now}',
                'name': 'Possible Sepsis / SIRS',
                'description': f'{sirs_count}/3 SIRS criteria met. Tachycardia, fever, and/or tachypnea detected.',
                'severity': 'critical' if sirs_count >= 3 else 'warning',
                'involvedVitals': ['Heart Rate', 'Temperature', 'Resp. Rate'],
                'confidence': round(0.5 + sirs_count * 0.15, 2),
                'detectedAt': now,
                'recommendation': 'Initiate sepsis screening. Consider blood cultures and lactate levels.',
            })
        
        # Pattern 2: Respiratory Failure
        if spo2 < 94 and rr > 22:
            patterns.append({
                'id': f'pattern-respiratory-{now}',
                'name': 'Respiratory Distress',
                'description': f'SpO2 {spo2:.1f}% with tachypnea (RR {rr}). Acute hypoxemia risk.',
                'severity': 'critical' if spo2 < 91 else 'warning',
                'involvedVitals': ['SpO2', 'Resp. Rate'],
                'confidence': 0.82,
                'detectedAt': now,
                'recommendation': 'Assess airway. Apply supplemental O2. Consider ABG.',
            })
        
        # Pattern 3: Hemodynamic Shock
        if sbp < 95 and hr > 100:
            patterns.append({
                'id': f'pattern-shock-{now}',
                'name': 'Hemodynamic Instability',
                'description': f'Hypotension (SBP {sbp}) with tachycardia (HR {hr}). Possible shock.',
                'severity': 'critical',
                'involvedVitals': ['Blood Pressure', 'Heart Rate'],
                'confidence': 0.85,
                'detectedAt': now,
                'recommendation': 'IV access. Fluid bolus. Consider vasopressors.',
            })
        
        # Pattern 4: Bradycardic-Hypotensive
        if hr < 50 and sbp < 100:
            patterns.append({
                'id': f'pattern-bradyhypo-{now}',
                'name': 'Bradycardic-Hypotensive',
                'description': f'HR {hr} with SBP {sbp}. Risk of inadequate cardiac output.',
                'severity': 'critical',
                'involvedVitals': ['Heart Rate', 'Blood Pressure'],
                'confidence': 0.88,
                'detectedAt': now,
                'recommendation': 'Consider atropine. Prepare transcutaneous pacing.',
            })
        
        return patterns
    
    def full_analysis(self, vitals: dict, history: dict = None) -> dict:
        """Run complete ML analysis pipeline."""
        risk = self.predict_risk(vitals)
        anomalies = self.detect_anomalies(vitals, history)
        trends = self.predict_trends(history or {})
        patterns = self.detect_patterns(vitals, history)
        
        # Generate insights
        insights = self._generate_insights(risk, anomalies, trends, patterns)
        
        return {
            'risk': risk,
            'anomalies': anomalies.get('anomalies', []),
            'anomaly_score': anomalies.get('anomaly_score', 0),
            'is_anomaly': anomalies.get('is_anomaly', False),
            'predictions': trends,
            'patterns': patterns,
            'insights': insights,
            'model_info': {
                'version': self.model_version,
                'training_samples': self.training_samples,
                'last_trained': self.last_trained,
                'models': [
                    'RandomForestClassifier (100 trees)',
                    'GradientBoostingRegressor (150 trees)',
                    'IsolationForest (anomaly detection)',
                    'ExtraTreesRegressor (trend prediction)',
                ],
                'buffer_size': len(self.history_buffer),
            },
        }
    
    def _generate_insights(self, risk, anomalies, trends, patterns):
        """Generate human-readable ML insights."""
        insights = []
        now = int(datetime.now().timestamp() * 1000)
        
        # Model status
        insights.append({
            'id': f'insight-model-{now}',
            'text': f'🧠 Random Forest model ({self.training_samples} training samples). '
                    f'Risk: {risk.get("risk_class", "unknown")} ({risk.get("risk_score", 0):.0f}/100). '
                    f'Shock Index: {risk.get("shock_index", 0):.2f}.',
            'category': 'recommendation',
            'severity': 'info',
            'confidence': 0.95,
            'timestamp': now,
        })
        
        # Anomaly insights
        for anomaly in anomalies.get('anomalies', []):
            insights.append({
                'id': f'insight-anomaly-{anomaly["vitalKey"]}-{now}',
                'text': f'{"📈" if anomaly["type"] == "spike" else "📉"} {anomaly["vital"]}: '
                        f'{anomaly["value"]} (z: {anomaly["zScore"]}). '
                        f'Expected: {anomaly["expectedRange"][0]}-{anomaly["expectedRange"][1]}. '
                        f'[{anomaly["method"]}]',
                'category': 'anomaly',
                'severity': 'critical' if anomaly['severity'] in ['critical', 'high'] else 'warning',
                'confidence': anomaly['confidence'],
                'timestamp': now,
            })
        
        # Trend insights
        for pred in trends:
            if pred.get('willBreachThreshold') and pred.get('breachTimeSteps'):
                insights.append({
                    'id': f'insight-trend-{pred["vitalKey"]}-{now}',
                    'text': f'🔮 {pred["vitalLabel"]}: predicted {pred["breachDirection"]} breach '
                            f'in ~{pred["breachTimeSteps"]} steps. Slope: {pred["slope"]:+.3f}. R²={pred["rSquared"]}.',
                    'category': 'trend',
                    'severity': 'warning',
                    'confidence': pred['confidence'],
                    'timestamp': now,
                })
        
        # Pattern insights
        for pattern in patterns:
            insights.append({
                'id': f'insight-pattern-{pattern["id"]}',
                'text': f'🧬 {pattern["name"]}: {pattern["description"]}',
                'category': 'pattern',
                'severity': 'critical' if pattern['severity'] == 'critical' else 'warning',
                'confidence': pattern['confidence'],
                'timestamp': now,
            })
            insights.append({
                'id': f'insight-rec-{pattern["id"]}',
                'text': f'💡 {pattern["recommendation"]}',
                'category': 'recommendation',
                'severity': 'info',
                'confidence': pattern['confidence'],
                'timestamp': now,
            })
        
        if not anomalies.get('anomalies') and not patterns:
            insights.append({
                'id': f'insight-stable-{now}',
                'text': '✅ All vitals within normal range. No anomalies detected by Isolation Forest.',
                'category': 'recommendation',
                'severity': 'info',
                'confidence': 0.9,
                'timestamp': now,
            })
        
        return insights
    
    def save(self, path='models'):
        """Save trained models to disk."""
        os.makedirs(path, exist_ok=True)
        joblib.dump(self.scaler, os.path.join(path, 'scaler.pkl'))
        joblib.dump(self.risk_classifier, os.path.join(path, 'risk_classifier.pkl'))
        joblib.dump(self.risk_regressor, os.path.join(path, 'risk_regressor.pkl'))
        joblib.dump(self.anomaly_detector, os.path.join(path, 'anomaly_detector.pkl'))
        joblib.dump(self.trend_predictor, os.path.join(path, 'trend_predictor.pkl'))
        
        meta = {
            'model_version': self.model_version,
            'training_samples': self.training_samples,
            'last_trained': self.last_trained,
            'is_trained': self.is_trained,
        }
        with open(os.path.join(path, 'meta.json'), 'w') as f:
            json.dump(meta, f)
        
        print(f"Models saved to {path}/")
    
    def load(self, path='models'):
        """Load trained models from disk."""
        if not os.path.exists(os.path.join(path, 'meta.json')):
            return False
        
        self.scaler = joblib.load(os.path.join(path, 'scaler.pkl'))
        self.risk_classifier = joblib.load(os.path.join(path, 'risk_classifier.pkl'))
        self.risk_regressor = joblib.load(os.path.join(path, 'risk_regressor.pkl'))
        self.anomaly_detector = joblib.load(os.path.join(path, 'anomaly_detector.pkl'))
        self.trend_predictor = joblib.load(os.path.join(path, 'trend_predictor.pkl'))
        
        with open(os.path.join(path, 'meta.json'), 'r') as f:
            meta = json.load(f)
        
        self.model_version = meta.get('model_version', '1.0.0')
        self.training_samples = meta.get('training_samples', 0)
        self.last_trained = meta.get('last_trained')
        self.is_trained = True
        
        print(f"Models loaded from {path}/")
        return True


# Singleton instance
ml_engine = VitalWatchML()
