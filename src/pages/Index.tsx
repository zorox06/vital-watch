import { useNavigate } from 'react-router-dom';
import { Stethoscope, Heart, ArrowRight, Activity, Brain, Shield, Wifi } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 animate-fade-in relative z-10">
        {/* Logo & Title */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-emerald-400/60 mx-auto flex items-center justify-center shadow-xl shadow-primary/25 float-gentle">
            <Activity className="w-10 h-10 text-primary-foreground drop-shadow" />
          </div>
          <div>
            <h1 className="text-4xl font-bold font-display gradient-text tracking-tight">VitalWatch</h1>
            <p className="text-muted-foreground text-sm mt-1.5 tracking-wide">Remote Patient Monitoring · IoT Agent</p>
          </div>
        </div>

        {/* Feature badges */}
        <div className="flex justify-center gap-2.5 flex-wrap stagger-children">
          {[
            { icon: Brain, text: 'ML Analysis', bg: 'lavender-card' },
            { icon: Wifi, text: 'Real-time IoT', bg: 'sky-card' },
            { icon: Shield, text: 'Smart Alerts', bg: 'mint-card' },
          ].map(badge => (
            <div key={badge.text} className={`${badge.bg} px-3.5 py-2 rounded-xl flex items-center gap-2 animate-fade-in`}>
              <badge.icon className="w-3.5 h-3.5 text-foreground/50" />
              <span className="text-[11px] font-semibold text-foreground/60">{badge.text}</span>
            </div>
          ))}
        </div>

        {/* Role Cards */}
        <div className="space-y-3 stagger-children">
          <button
            onClick={() => navigate('/login/doctor')}
            className="w-full glass-card p-5 flex items-center gap-4 text-left group transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 animate-fade-in"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-500/70 flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0 group-hover:shadow-xl group-hover:shadow-primary/30 group-hover:scale-105 transition-all duration-300">
              <Stethoscope className="w-7 h-7 text-primary-foreground drop-shadow" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold font-display text-foreground">I'm a Doctor</h2>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Create a monitoring room and track your patient's vitals with ML-powered analysis
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1.5 transition-all duration-300 flex-shrink-0" />
          </button>

          <button
            onClick={() => navigate('/login/patient')}
            className="w-full glass-card p-5 flex items-center gap-4 text-left group transition-all duration-300 hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-0.5 animate-fade-in"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-orange-400/70 flex items-center justify-center shadow-lg shadow-accent/20 flex-shrink-0 group-hover:shadow-xl group-hover:shadow-accent/30 group-hover:scale-105 transition-all duration-300">
              <Heart className="w-7 h-7 text-accent-foreground drop-shadow" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold font-display text-foreground">I'm a Patient</h2>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Enter your doctor's room code to share your vitals for remote monitoring
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-accent group-hover:translate-x-1.5 transition-all duration-300 flex-shrink-0" />
          </button>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2 pt-2">
          <p className="text-[10px] text-muted-foreground/40 font-mono tracking-wider">
            VitalWatch IoT Agent v1.0 · ML-Powered Monitoring
          </p>
          <div className="flex justify-center gap-3 text-[10px] text-muted-foreground/30">
            <span>Anomaly Detection</span>
            <span className="text-primary/30">·</span>
            <span>Trend Prediction</span>
            <span className="text-primary/30">·</span>
            <span>Pattern Recognition</span>
          </div>
        </div>
      </div>
    </div>
  );
}
