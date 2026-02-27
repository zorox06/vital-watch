import { useState } from 'react';
import { usePatientRoom } from '@/hooks/useRoom';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '@/lib/auth';
import {
    Heart, ArrowLeft, LogIn, Wifi, WifiOff,
    Activity, Thermometer, Wind, Waves, LogOut
} from 'lucide-react';

export default function PatientPortal() {
    const navigate = useNavigate();
    const session = getSession();
    const userName = session?.name || 'Patient';
    const { connected, roomCode, error, vitals, patientName, patientInfo, joinRoom, leaveRoom } = usePatientRoom();
    const [codeInput, setCodeInput] = useState('');

    const handleJoin = () => {
        if (codeInput.length === 6) {
            joinRoom(codeInput);
        }
    };

    // =================== JOIN SCREEN ===================
    if (!connected) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background orb */}
                <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />
                <div className="max-w-md w-full space-y-6 animate-fade-in relative z-10">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
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
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-accent via-accent/80 to-orange-400/60 mx-auto flex items-center justify-center shadow-xl shadow-accent/25 float-gentle mb-4">
                            <Heart className="w-8 h-8 text-accent-foreground drop-shadow" />
                        </div>
                        <h1 className="text-3xl font-bold font-display text-foreground">Hi, {userName}</h1>
                        <p className="text-muted-foreground text-sm">Connect to your doctor's monitoring room</p>
                    </div>

                    <div className="glass-card p-6 space-y-5">
                        <div className="text-center">
                            <h2 className="text-lg font-bold font-display text-foreground">Enter Room Code</h2>
                            <p className="text-xs text-muted-foreground mt-1">Ask your doctor for the 6-digit room code</p>
                        </div>

                        {/* Code Input */}
                        <div className="flex justify-center gap-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${codeInput[i]
                                        ? 'border-primary bg-primary/5'
                                        : i === codeInput.length
                                            ? 'border-primary/50 bg-primary/5'
                                            : 'border-border bg-muted/50'
                                        }`}
                                >
                                    <span className="text-2xl font-bold font-mono text-foreground">
                                        {codeInput[i] || ''}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Hidden input for keyboard */}
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={codeInput}
                            onChange={e => setCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full px-4 py-3.5 rounded-xl bg-background/60 border border-border/50 text-center font-mono text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all placeholder:text-muted-foreground/25"
                            placeholder="000000"
                            autoFocus
                        />

                        {error && (
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-medium">
                                <WifiOff className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleJoin}
                            disabled={codeInput.length !== 6}
                            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-accent to-orange-400/90 text-accent-foreground font-semibold text-base shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/35 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
                        >
                            <LogIn className="w-5 h-5" />
                            Connect to Room
                        </button>
                    </div>

                    <div className="soft-card p-4">
                        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                            🔒 Your vitals data is shared only with your doctor's monitoring dashboard via a secure local connection.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // =================== CONNECTED VIEW ===================
    const vitalDisplay = [
        { key: 'heartRate', label: 'Heart Rate', unit: 'BPM', icon: Heart, color: 'peach-card' },
        { key: 'systolic', label: 'Blood Pressure', unit: 'mmHg', icon: Activity, color: 'sky-card' },
        { key: 'spo2', label: 'SpO2', unit: '%', icon: Wind, color: 'mint-card' },
        { key: 'temperature', label: 'Temperature', unit: '°F', icon: Thermometer, color: 'lavender-card' },
        { key: 'respRate', label: 'Resp. Rate', unit: '/min', icon: Waves, color: 'accent-card' },
    ];

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground">
                            Connected to Room: <span className="font-mono font-bold text-primary">{roomCode}</span>
                        </p>
                        <h1 className="text-2xl font-bold font-display text-foreground">My Vitals</h1>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-mint text-success text-xs font-medium">
                        <Wifi className="w-3.5 h-3.5" />
                        Streaming
                    </div>
                </div>

                {/* Patient Info */}
                <div className="soft-card p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-bold font-display text-primary">
                            {patientName.split(' ').map(w => w[0]).join('')}
                        </span>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{patientName}</p>
                        <p className="text-xs text-muted-foreground">
                            {patientInfo.age}y · {patientInfo.gender} · {patientInfo.diagnosis}
                        </p>
                    </div>
                </div>

                {/* Vitals Display */}
                {vitals ? (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            {vitalDisplay.map(vd => {
                                const Icon = vd.icon;
                                const val = vitals[vd.key as keyof typeof vitals];
                                const displayVal = vd.key === 'systolic'
                                    ? `${vitals.systolic}/${vitals.diastolic}`
                                    : vd.key === 'spo2' || vd.key === 'temperature'
                                        ? val.toFixed(1)
                                        : val;

                                return (
                                    <div key={vd.key} className={`${vd.color} p-4 rounded-2xl`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-7 h-7 rounded-lg bg-card/50 flex items-center justify-center">
                                                <Icon className="w-3.5 h-3.5 text-foreground/60" />
                                            </div>
                                            <span className="text-[10px] font-medium text-foreground/60">{vd.label}</span>
                                        </div>
                                        <div>
                                            <span className="text-2xl font-bold font-display text-foreground">{displayVal}</span>
                                            <span className="text-xs text-muted-foreground ml-1">{vd.unit}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Streaming indicator */}
                        <div className="soft-card p-4 text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <div className="flex gap-1">
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <div
                                            key={i}
                                            className="w-1 bg-primary rounded-full streaming-bar"
                                            style={{
                                                height: `${10 + Math.random() * 14}px`,
                                                animationDelay: `${i * 0.15}s`,
                                            }}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs font-medium text-foreground/70">Streaming vitals to doctor...</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">Data updates every 2.5 seconds</p>
                        </div>
                    </div>
                ) : (
                    <div className="soft-card p-8 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-3">
                            <span className="text-lg">🔄</span>
                        </div>
                        <p className="text-sm font-medium text-foreground">Initializing sensors...</p>
                        <p className="text-xs text-muted-foreground mt-1">Vitals will appear shortly</p>
                    </div>
                )}

                {/* Disconnect Button */}
                <button
                    onClick={() => { leaveRoom(); navigate('/'); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-destructive/10 text-destructive font-semibold text-sm hover:bg-destructive/15 active:scale-95 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                </button>
                <button
                    onClick={() => { leaveRoom(); logout(); navigate('/'); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-muted text-muted-foreground font-medium text-sm hover:bg-muted/80 active:scale-95 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </div>
    );
}
