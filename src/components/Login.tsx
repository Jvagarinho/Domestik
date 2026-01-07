import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, Lock, Mail, Loader2, Home, UserPlus } from 'lucide-react';

export function Login() {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const { error } = mode === 'login'
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: 'admin' // The first user can be admin, or we can make this more complex later
                    }
                }
            });

        if (error) {
            setError(error.message);
        } else if (mode === 'signup') {
            setSuccess('Registration successful! Please sign in.');
            setMode('login');
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'var(--bg-main)',
        }}>
            <div className="card animate-fade-in" style={{
                width: '100%',
                maxWidth: '430px',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '28px',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        background: mode === 'login' ? 'var(--primary-emerald)' : 'var(--primary-indigo)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        color: 'white',
                        boxShadow: mode === 'login'
                            ? '0 12px 24px rgba(16, 185, 129, 0.25)'
                            : '0 12px 24px rgba(99, 102, 241, 0.25)',
                        transition: 'all 0.3s ease'
                    }}>
                        <Home size={36} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                        {mode === 'login' ? 'Enter your credentials to continue' : 'Join Domestik to start managing your business'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '14px 16px 14px 48px',
                                    fontSize: '1rem',
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '14px 16px 14px 48px',
                                    fontSize: '1rem',
                                }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: '12px',
                            color: '#B91C1C',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            padding: '12px 16px',
                            background: '#ECFDF5',
                            border: '1px solid #A7F3D0',
                            borderRadius: '12px',
                            color: '#065F46',
                            fontSize: '0.875rem'
                        }}>
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            background: mode === 'login' ? 'var(--primary-emerald)' : 'var(--primary-indigo)',
                            color: 'white',
                            width: '100%',
                            padding: '16px',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            marginTop: '10px'
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : (mode === 'login' ? <LogIn size={24} /> : <UserPlus size={24} />)}
                        {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                        {' '}
                        <button
                            onClick={() => {
                                setMode(mode === 'login' ? 'signup' : 'login');
                                setError(null);
                                setSuccess(null);
                            }}
                            style={{
                                background: 'none',
                                color: mode === 'login' ? 'var(--primary-emerald)' : 'var(--primary-indigo)',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                padding: '4px'
                            }}
                        >
                            {mode === 'login' ? 'Create one now' : 'Sign in instead'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
