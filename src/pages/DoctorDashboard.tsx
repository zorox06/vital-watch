import { useState } from 'react';
import { useDoctorRoom } from '@/hooks/useRoom';
import { useMLAnalysis } from '@/hooks/useMLAnalysis';
import { VITAL_CONFIGS, getVitalStatus, type Vitals } from '@/lib/mockData';
import VitalCard from '@/components/dashboard/VitalCard';
import RiskScore from '@/components/dashboard/RiskScore';
import VitalsTimeline from '@/components/dashboard/VitalsTimeline';
import EmergencyModal from '@/components/dashboard/EmergencyModal';
import AlertHistory from '@/components/dashboard/AlertHistory';
import ThresholdSettings from '@/components/dashboard/ThresholdSettings';
import AnomalyDetection from '@/components/dashboard/AnomalyDetection';
import PredictiveAlerts from '@/components/dashboard/PredictiveAlerts';
import PatternRecognition from '@/components/dashboard/PatternRecognition';
import MLInsightsPanel from '@/components/dashboard/MLInsightsPanel';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '@/lib/auth';
import {
    Heart, Bell, Clock, Sliders, Brain, Copy, Check, Users,
    ArrowLeft, Stethoscope, Activity, Wifi, WifiOff, LogOut
} from 'lucide-react';

type Tab = 'dashboard' | 'alerts' | 'ai' | 'settings';

const cardColors = ['mint-card', 'sky-card', 'lavender-card', 'peach-card', 'accent-card'];

interface AlertEntry {
    id: string;
    patientId: string;
    patientName: string;
    vital: string;
    value: number;
    threshold: string;
    severity: 'Critical' | 'High' | 'Medium';
    timestamp: Date;
    acknowledged: boolean;
    workflowStatus: 'Pending' | 'Dispatched' | 'En Route' | 'Arrived';
    eta?: number;
}

export default function DoctorDashboard() {
    const navigate = useNavigate();
    const session = getSession();
    const doctorName = session?.name || 'Doctor';
    const { roomCode, patients, startRoom, closeRoom } = useDoctorRoom();
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [copied, setCopied] = useState(false);
    const [alerts, setAlerts] = useState<AlertEntry[]>([]);
    const [activeAlert, setActiveAlert] = useState<AlertEntry | null>(null);
    const lastAlertRef = useState<Record<string, number>>(() => ({}))[0];

    // Pick the first connected patient for monitoring
    const patientNames = Object.keys(patients);
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
    const currentPatientName = selectedPatient && patients[selectedPatient] ? selectedPatient : patientNames[0] || null;
    const currentPatient = currentPatientName ? patients[currentPatientName] : null;

    // ML Analysis
    const emptyHistory = { heartRate: [], systolic: [], diastolic: [], spo2: [], temperature: [], respRate: [] };
    const mlAnalysis = useMLAnalysis(
        currentPatient ? currentPatient.history : emptyHistory as Record<keyof Vitals, { timestamp: number; value: number }[]>
    );

    // Alert detection from vitals
    if (currentPatient && currentPatient.vitals) {
        const now = Date.now();
        for (const config of VITAL_CONFIGS) {
            const val = currentPatient.vitals[config.key];
            const status = getVitalStatus(config.key, val);
            if (status === 'critical') {
                const lastForVital = lastAlertRef[config.key] || 0;
                if (now - lastForVital > 15000) {
                    const alertId = `alert-${now}-${config.key}`;
                    const newAlert: AlertEntry = {
                        id: alertId,
                        patientId: 'remote',
                        patientName: currentPatientName || '',
                        vital: config.label,
                        value: val,
                        threshold: `${config.criticalMin}-${config.criticalMax}`,
                        severity: 'Critical',
                        timestamp: new Date(),
                        acknowledged: false,
                        workflowStatus: 'Pending',
                    };
                    lastAlertRef[config.key] = now;
                    // Use a timeout to avoid updating state during render
                    setTimeout(() => {
                        setAlerts(prev => [newAlert, ...prev].slice(0, 20));
                        setActiveAlert(prev => prev && !prev.acknowledged ? prev : newAlert);
                    }, 0);
                }
            }
        }
    }

    const acknowledgeAlert = (alertId: string) => {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
        setActiveAlert(null);
    };

    const dispatchEmergency = (alertId: string) => {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, workflowStatus: 'Dispatched', eta: 8, acknowledged: true } : a));
        setActiveAlert(null);
        setTimeout(() => setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, workflowStatus: 'En Route', eta: 5 } : a)), 3000);
        setTimeout(() => setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, workflowStatus: 'Arrived', eta: 0 } : a)), 8000);
    };

    const handleCopyCode = () => {
        if (roomCode) {
            navigator.clipboard.writeText(roomCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

    // =================== ROOM CREATION SCREEN ===================
    if (!roomCode) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="max-w-md w-full space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        <button
                            onClick={() => { logout(); navigate('/'); }}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>

                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-emerald-500/60 mx-auto flex items-center justify-center shadow-xl shadow-primary/25 float-gentle mb-4">
                            <Stethoscope className="w-8 h-8 text-primary-foreground drop-shadow" />
                        </div>
                        <h1 className="text-3xl font-bold font-display text-foreground">Welcome, {doctorName}</h1>
                        <p className="text-muted-foreground text-sm">Create a monitoring room for your patient</p>
                    </div>

                    <div className="glass-card p-6 space-y-4">
                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint to-mint/60 mx-auto flex items-center justify-center">
                                <Activity className="w-6 h-6 text-success" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold font-display text-foreground">Start Monitoring</h2>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    Create a room and share the code with your patient. Their vitals will stream to your dashboard in real-time.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={startRoom}
                            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-primary to-emerald-500/90 text-primary-foreground font-semibold text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 active:scale-[0.98] transition-all duration-200"
                        >
                            <Heart className="w-5 h-5" />
                            Create Monitoring Room
                        </button>
                    </div>

                    <div className="soft-card p-4 space-y-3">
                        <h3 className="text-[10px] font-bold text-foreground/50 uppercase tracking-[0.15em]">How it works</h3>
                        <div className="space-y-2.5 stagger-children">
                            {[
                                { step: '1', text: 'Create a room to get a unique 6-digit code', icon: '🏥' },
                                { step: '2', text: 'Share the code with your patient', icon: '🔗' },
                                { step: '3', text: 'Patient connects and vitals stream live', icon: '📡' },
                                { step: '4', text: 'ML engine analyzes patterns in real-time', icon: '🧠' },
                            ].map(item => (
                                <div key={item.step} className="flex items-center gap-3 animate-fade-in">
                                    <div className="w-8 h-8 rounded-xl bg-background/60 flex items-center justify-center text-sm">
                                        {item.icon}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =================== WAITING FOR PATIENT ===================
    if (patientNames.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="max-w-md w-full space-y-6 animate-fade-in">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-emerald-500/60 mx-auto flex items-center justify-center shadow-xl shadow-primary/25 mb-4">
                            <Wifi className="w-8 h-8 text-primary-foreground animate-pulse drop-shadow" />
                        </div>
                        <h1 className="text-2xl font-bold font-display text-foreground">Room Created!</h1>
                        <p className="text-muted-foreground text-sm">Waiting for patient to connect...</p>
                    </div>

                    {/* Room Code Display */}
                    <div className="glass-card p-6 space-y-4">
                        <p className="text-[10px] text-center text-muted-foreground/60 font-semibold uppercase tracking-[0.15em]">Share this code with your patient</p>
                        <div className="flex items-center justify-center gap-3">
                            <div className="flex gap-2 stagger-children">
                                {roomCode.split('').map((digit, i) => (
                                    <div
                                        key={i}
                                        className="w-12 h-14 rounded-xl bg-gradient-to-b from-primary/8 to-primary/3 border-2 border-primary/20 flex items-center justify-center animate-scale-in shadow-sm"
                                    >
                                        <span className="text-2xl font-bold font-mono text-primary">{digit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={handleCopyCode}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm active:scale-[0.98] transition-all duration-200 ${copied ? 'bg-mint text-success' : 'bg-background/60 text-foreground hover:bg-background/80 border border-border/50'
                                }`}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied!' : 'Copy Room Code'}
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-success pulse-live" />
                        <span>Listening for connections...</span>
                    </div>

                    <button
                        onClick={() => { closeRoom(); navigate('/'); }}
                        className="w-full px-4 py-3 rounded-2xl bg-muted text-muted-foreground font-medium text-sm hover:bg-muted/80 transition-all"
                    >
                        Cancel & Go Back
                    </button>
                </div>
            </div>
        );
    }

    // =================== MONITORING DASHBOARD ===================
    const vitals = currentPatient?.vitals || { heartRate: 0, systolic: 0, diastolic: 0, spo2: 0, temperature: 0, respRate: 0 };
    const history = currentPatient?.history || emptyHistory;

    const tabConfig = [
        { key: 'dashboard' as Tab, icon: Heart, label: 'Monitor' },
        { key: 'alerts' as Tab, icon: Bell, label: 'Alerts', badge: unacknowledgedCount },
        { key: 'ai' as Tab, icon: Brain, label: 'AI' },
        { key: 'settings' as Tab, icon: Sliders, label: 'Settings' },
    ];

    return (
        <div className="min-h-screen bg-background pb-28">
            <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground">{doctorName} · Room: <span className="font-mono font-bold text-primary">{roomCode}</span></p>
                        <h1 className="text-2xl font-bold font-display text-foreground">Doctor Monitor</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-mint text-success text-xs font-medium">
                            <div className="w-2 h-2 rounded-full bg-success pulse-live" />
                            Live
                        </div>
                    </div>
                </div>

                {/* Patient Selector (if multiple) */}
                {patientNames.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {patientNames.map(name => (
                            <button
                                key={name}
                                onClick={() => setSelectedPatient(name)}
                                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${currentPatientName === name
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Patient Info Banner */}
                {currentPatient && (
                    <div className="soft-card p-4 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-foreground">{currentPatientName}</p>
                            <p className="text-xs text-muted-foreground">
                                {currentPatient.info.age}y · {currentPatient.info.gender} · {currentPatient.info.diagnosis}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Wifi className="w-3.5 h-3.5 text-success" />
                            <span className="text-[10px] text-success font-medium">Connected</span>
                        </div>
                    </div>
                )}

                {/* ===== DASHBOARD TAB ===== */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-5 animate-fade-in">
                        <RiskScore score={mlAnalysis.mlRiskScore} isMLEnhanced />

                        <div className="grid grid-cols-2 gap-3">
                            {VITAL_CONFIGS.map((config, i) => {
                                const value = vitals[config.key];
                                const status = getVitalStatus(config.key, value);
                                return (
                                    <VitalCard
                                        key={config.key}
                                        config={config}
                                        value={value}
                                        secondaryValue={config.key === 'systolic' ? vitals.diastolic : undefined}
                                        status={status}
                                        history={history[config.key] || []}
                                        colorClass={status === 'critical' ? 'soft-card' : cardColors[i % cardColors.length]}
                                    />
                                );
                            })}
                        </div>

                        <VitalsTimeline history={history as Record<keyof Vitals, { timestamp: number; value: number }[]>} />
                    </div>
                )}

                {/* ===== ALERTS TAB ===== */}
                {activeTab === 'alerts' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-peach flex items-center justify-center">
                                <span className="text-sm">🚨</span>
                            </div>
                            <h2 className="text-sm font-bold font-display text-foreground">Alert History</h2>
                        </div>
                        <AlertHistory alerts={alerts} />
                    </div>
                )}

                {/* ===== AI ANALYSIS TAB ===== */}
                {activeTab === 'ai' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <Brain className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold font-display text-foreground">AI Analysis</h2>
                                <p className="text-[10px] text-muted-foreground">ML-powered patient monitoring</p>
                            </div>
                        </div>

                        <AnomalyDetection anomalies={mlAnalysis.anomalies} />
                        <PredictiveAlerts predictions={mlAnalysis.predictions} />
                        <PatternRecognition patterns={mlAnalysis.patterns} />
                        <MLInsightsPanel insights={mlAnalysis.insights} mlRiskScore={mlAnalysis.mlRiskScore} />
                    </div>
                )}

                {/* ===== SETTINGS TAB ===== */}
                {activeTab === 'settings' && (
                    <div className="space-y-4 animate-fade-in">
                        <ThresholdSettings />

                        <div className="soft-card p-4 space-y-3">
                            <h3 className="text-sm font-bold font-display text-foreground">Room Management</h3>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Room Code</span>
                                <span className="font-mono font-bold text-primary">{roomCode}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Connected Patients</span>
                                <span className="font-bold text-foreground">{patientNames.length}</span>
                            </div>
                            <button
                                onClick={() => { closeRoom(); navigate('/'); }}
                                className="w-full px-4 py-3 rounded-2xl bg-destructive/10 text-destructive font-semibold text-sm hover:bg-destructive/15 active:scale-95 transition-all"
                            >
                                Close Room & Disconnect
                            </button>
                            <button
                                onClick={() => { closeRoom(); logout(); navigate('/'); }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-muted text-muted-foreground font-medium text-sm hover:bg-muted/80 active:scale-95 transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Nav */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40" style={{ width: 'min(280px, 70vw)' }}>
                <div className="bg-card/95 backdrop-blur-xl border border-border/40 shadow-2xl shadow-black/10 rounded-[28px] px-3 py-2.5 flex items-center justify-around">
                    {tabConfig.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${isActive
                                    ? 'bg-primary/12 text-primary scale-110'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                            >
                                <Icon className={`w-[22px] h-[22px] transition-transform duration-200 ${isActive ? 'drop-shadow-sm' : ''}`} />
                                {tab.badge > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center px-1 ring-[2.5px] ring-card shadow-md animate-in zoom-in-50">
                                        {tab.badge > 9 ? '9+' : tab.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Emergency Modal */}
            {activeAlert && !activeAlert.acknowledged && (
                <EmergencyModal
                    alert={{ ...activeAlert }}
                    onAcknowledge={acknowledgeAlert}
                    onDispatch={dispatchEmergency}
                />
            )}
        </div>
    );
}
