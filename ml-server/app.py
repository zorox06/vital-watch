"""
VitalWatch Flask ML API Server
================================
Runs locally on your PC. The React frontend calls this for ML predictions.

Endpoints:
  POST /api/analyze       — Full ML analysis (risk + anomalies + trends + patterns)
  POST /api/predict-risk  — Risk score + classification
  POST /api/anomalies     — Anomaly detection
  POST /api/trends        — Trend prediction
  POST /api/patterns      — Clinical pattern detection
  GET  /api/model-info    — Model metadata
  POST /api/retrain       — Retrain models with new data

Usage:
  pip install -r requirements.txt
  python app.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from ml_model import ml_engine
import os

app = Flask(__name__)
CORS(app)  # Allow frontend to call from localhost:8080

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')


# ========================= STARTUP ==========================================

def initialize():
    """Load or train models on startup."""
    if ml_engine.load(MODEL_DIR):
        print(f"✅ Loaded pre-trained models (v{ml_engine.model_version})")
    else:
        print("⚙️  No saved models found. Training from scratch...")
        ml_engine.train()
        ml_engine.save(MODEL_DIR)
        print("✅ Models trained and saved!")


# ========================= API ROUTES ========================================

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Full ML analysis — returns risk, anomalies, trends, patterns, insights."""
    data = request.get_json()
    if not data or 'vitals' not in data:
        return jsonify({'error': 'Missing vitals data'}), 400
    
    vitals = data['vitals']
    history = data.get('history', {})
    
    result = ml_engine.full_analysis(vitals, history)
    return jsonify(result)


@app.route('/api/predict-risk', methods=['POST'])
def predict_risk():
    """Predict patient risk score and classification."""
    data = request.get_json()
    if not data or 'vitals' not in data:
        return jsonify({'error': 'Missing vitals data'}), 400
    
    result = ml_engine.predict_risk(data['vitals'])
    return jsonify(result)


@app.route('/api/anomalies', methods=['POST'])
def detect_anomalies():
    """Detect anomalies in current vitals."""
    data = request.get_json()
    if not data or 'vitals' not in data:
        return jsonify({'error': 'Missing vitals data'}), 400
    
    result = ml_engine.detect_anomalies(data['vitals'], data.get('history'))
    return jsonify(result)


@app.route('/api/trends', methods=['POST'])
def predict_trends():
    """Predict vital sign trends."""
    data = request.get_json()
    if not data or 'history' not in data:
        return jsonify({'error': 'Missing history data'}), 400
    
    result = ml_engine.predict_trends(data['history'])
    return jsonify(result)


@app.route('/api/patterns', methods=['POST'])
def detect_patterns():
    """Detect clinical patterns."""
    data = request.get_json()
    if not data or 'vitals' not in data:
        return jsonify({'error': 'Missing vitals data'}), 400
    
    result = ml_engine.detect_patterns(data['vitals'], data.get('history'))
    return jsonify(result)


@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Get model metadata and status."""
    return jsonify({
        'is_trained': ml_engine.is_trained,
        'model_version': ml_engine.model_version,
        'training_samples': ml_engine.training_samples,
        'last_trained': ml_engine.last_trained,
        'models': [
            'RandomForestClassifier (100 trees, depth=12)',
            'GradientBoostingRegressor (150 trees, lr=0.1)',
            'IsolationForest (contamination=0.1)',
            'ExtraTreesRegressor (80 trees, depth=8)',
        ],
        'features': ml_engine.FEATURE_COLS,
        'buffer_size': len(ml_engine.history_buffer),
    })


@app.route('/api/retrain', methods=['POST'])
def retrain():
    """Retrain models (optionally with custom data)."""
    data = request.get_json() or {}
    n_samples = data.get('n_samples', 5000)
    
    result = ml_engine.train()
    ml_engine.save(MODEL_DIR)
    
    return jsonify({
        'success': True,
        'message': 'Models retrained successfully',
        **result,
    })


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'ml_ready': ml_engine.is_trained,
    })


# ========================= MAIN ==============================================

if __name__ == '__main__':
    initialize()
    print("\n🚀 VitalWatch ML Server running at http://localhost:5000")
    print("   Frontend should call: http://localhost:5000/api/analyze")
    print("   Model info: http://localhost:5000/api/model-info\n")
    app.run(host='0.0.0.0', port=5000, debug=True)
