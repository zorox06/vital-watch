import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup, DEMO_CREDENTIALS } from '@/lib/auth';
import {
    Stethoscope, Heart, Mail, Lock, User, ArrowLeft,
    Eye, EyeOff, LogIn, UserPlus, Info, ChevronDown
} from 'lucide-react';

interface Props {
    role: 'doctor' | 'patient';
}

export default function LoginPage({ role }: Props) {
    const navigate = useNavigate();
    const [isSignup, setIsSignup] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDemo, setShowDemo] = useState(false);

    const isDoctor = role === 'doctor';
    const demoAccounts = isDoctor ? DEMO_CREDENTIALS.doctors : DEMO_CREDENTIALS.patients;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (isSignup) {
            const result = signup(name, email, password, role);
            if (result.success) {
                navigate(isDoctor ? '/doctor' : '/patient');
            } else {
                setError(result.error || 'Signup failed');
            }
        } else {
            const result = login(email, password, role);
            if (result.success) {
                navigate(isDoctor ? '/doctor' : '/patient');
            } else {
                setError(result.error || 'Login failed');
            }
        }
    };

    const handleDemoLogin = (demoEmail: string, demoPass: string) => {
        const result = login(demoEmail, demoPass, role);
        if (result.success) {
            navigate(isDoctor ? '/doctor' : '/patient');
        }
    };

    const accentGradient = isDoctor
        ? 'from-primary via-primary/80 to-emerald-500/60'
        : 'from-accent via-accent/80 to-orange-400/60';

    const accentShadow = isDoctor ? 'shadow-primary/25' : 'shadow-accent/25';

    const btnClass = isDoctor
        ? 'bg-gradient-to-r from-primary to-emerald-500/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30'
        : 'bg-gradient-to-r from-accent to-orange-400/90 text-accent-foreground shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30';

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background orb */}
            <div className={`absolute top-[-15%] right-[-10%] w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none ${isDoctor ? 'bg-primary/6' : 'bg-accent/6'}`} />

            <div className="max-w-md w-full space-y-6 animate-fade-in relative z-10">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back
                </button>

                {/* Header */}
                <div className="text-center space-y-3">
                    <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${accentGradient} mx-auto flex items-center justify-center shadow-xl ${accentShadow} float-gentle`}>
                        {isDoctor
                            ? <Stethoscope className="w-8 h-8 text-primary-foreground drop-shadow" />
                            : <Heart className="w-8 h-8 text-accent-foreground drop-shadow" />
                        }
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-display text-foreground">
                            {isDoctor ? 'Doctor' : 'Patient'} {isSignup ? 'Sign Up' : 'Login'}
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {isDoctor
                                ? 'Access your patient monitoring dashboard'
                                : 'Connect with your doctor for remote monitoring'
                            }
                        </p>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
                    {isSignup && (
                        <div className="space-y-1.5 animate-fade-in">
                            <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder={isDoctor ? 'Dr. Smith' : 'John Doe'}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-background/60 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all placeholder:text-muted-foreground/30"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder={isDoctor ? 'doctor@vitalwatch.com' : 'patient@email.com'}
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-background/60 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all placeholder:text-muted-foreground/30"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-background/60 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all placeholder:text-muted-foreground/30"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground/60 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-destructive/8 border border-destructive/15 text-destructive text-xs font-medium animate-fade-in">
                            <Info className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm active:scale-[0.98] transition-all duration-200 ${btnClass}`}
                    >
                        {isSignup ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                        {isSignup ? 'Create Account' : 'Sign In'}
                    </button>

                    {/* Toggle login/signup */}
                    <div className="text-center pt-1">
                        <button
                            type="button"
                            onClick={() => { setIsSignup(!isSignup); setError(null); }}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                            {isSignup
                                ? 'Already have an account? Sign in'
                                : "Don't have an account? Sign up"
                            }
                        </button>
                    </div>
                </form>

                {/* Demo Credentials */}
                {!isSignup && (
                    <div className="soft-card p-4 space-y-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <button
                            onClick={() => setShowDemo(!showDemo)}
                            className="w-full flex items-center justify-between text-xs font-semibold text-foreground/50 hover:text-foreground/70 transition-colors"
                        >
                            <span>🔑 Demo Credentials</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showDemo ? 'rotate-180' : ''}`} />
                        </button>

                        {showDemo && (
                            <div className="space-y-2 stagger-children">
                                {demoAccounts.map(acc => (
                                    <button
                                        key={acc.email}
                                        onClick={() => handleDemoLogin(acc.email, acc.password)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl bg-background/50 hover:bg-background transition-all text-left group animate-fade-in border border-transparent hover:border-primary/15"
                                    >
                                        <div>
                                            <p className="text-xs font-semibold text-foreground">{acc.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono">{acc.email}</p>
                                        </div>
                                        <span className="text-[10px] text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                            Quick Login →
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
