import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, Lock, Mail, Loader2, UserPlus } from 'lucide-react';
import { useI18n } from '../i18n';

export function Login() {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const { t } = useI18n();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const { error } = mode === 'login'
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({
                email,
                password
            });

        if (error) {
            setError(error.message);
        } else if (mode === 'signup') {
            setSuccess(t('login.signupSuccess'));
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
                    <img 
                        src="/logo.png" 
                        alt="Domestik Logo" 
                        style={{
                            width: '120px',
                            height: 'auto',
                            margin: '0 auto 20px',
                            display: 'block'
                        }}
                    />
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                        {mode === 'login' ? t('login.title') : t('signup.title')}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                        {mode === 'login' ? t('login.subtitle') : t('signup.subtitle')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>{t('login.emailLabel')}</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                placeholder={t('login.emailPlaceholder')}
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
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>{t('login.passwordLabel')}</label>
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
                        {loading ? t('login.processing') : (mode === 'login' ? t('login.signIn') : t('login.signUp'))}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {mode === 'login' ? t('login.noAccount') : t('login.haveAccount')}
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
                            {mode === 'login' ? t('login.createOne') : t('login.signInInstead')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
