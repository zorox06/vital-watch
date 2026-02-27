// Simple localStorage-based auth for demo purposes

export interface UserSession {
    role: 'doctor' | 'patient';
    name: string;
    email: string;
    loggedInAt: number;
}

const SESSION_KEY = 'vitalwatch-session';

// Demo credentials
const DEMO_ACCOUNTS = {
    doctors: [
        { email: 'doctor@vitalwatch.com', password: 'doctor123', name: 'Dr. Patel' },
        { email: 'dr.chen@vitalwatch.com', password: 'chen123', name: 'Dr. Chen' },
        { email: 'dr.nguyen@vitalwatch.com', password: 'nguyen123', name: 'Dr. Nguyen' },
    ],
    patients: [
        { email: 'john@email.com', password: 'patient123', name: 'John D.' },
        { email: 'sarah@email.com', password: 'patient123', name: 'Sarah K.' },
        { email: 'robert@email.com', password: 'patient123', name: 'Robert M.' },
        { email: 'emily@email.com', password: 'patient123', name: 'Emily L.' },
    ],
};

export function login(
    email: string,
    password: string,
    role: 'doctor' | 'patient'
): { success: boolean; error?: string; session?: UserSession } {
    const accounts = role === 'doctor' ? DEMO_ACCOUNTS.doctors : DEMO_ACCOUNTS.patients;
    const account = accounts.find(a => a.email === email && a.password === password);

    if (!account) {
        return { success: false, error: 'Invalid email or password' };
    }

    const session: UserSession = {
        role,
        name: account.name,
        email: account.email,
        loggedInAt: Date.now(),
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, session };
}

export function signup(
    name: string,
    email: string,
    password: string,
    role: 'doctor' | 'patient'
): { success: boolean; error?: string; session?: UserSession } {
    if (!name || !email || !password) {
        return { success: false, error: 'All fields are required' };
    }
    if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
    }

    const session: UserSession = {
        role,
        name: role === 'doctor' ? `Dr. ${name}` : name,
        email,
        loggedInAt: Date.now(),
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, session };
}

export function getSession(): UserSession | null {
    try {
        const data = localStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

export function logout(): void {
    localStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated(role?: 'doctor' | 'patient'): boolean {
    const session = getSession();
    if (!session) return false;
    if (role && session.role !== role) return false;
    return true;
}

export const DEMO_CREDENTIALS = DEMO_ACCOUNTS;
