import React, { useState } from 'react';
import type { Client } from '../types';
import { useI18n } from '../i18n';
import { validateClient } from '../lib/validation';
import { useToast } from '../hooks/useToast';

interface ClientFormProps {
    initialClient?: Client;
    onSave: (name: string, color: string) => Promise<void>;
    onClose: () => void;
}

const CLIENT_COLORS = [
    '#10B981', // Emerald
    '#6366F1', // Indigo
    '#F43F5E', // Rose
    '#F59E0B', // Amber
    '#3B82F6', // Blue
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#84CC16', // Lime
    '#64748B'  // Slate
];

export function ClientForm({ initialClient, onSave, onClose }: ClientFormProps) {
    const [name, setName] = useState(initialClient?.name || '');
    const [color, setColor] = useState(initialClient?.color || CLIENT_COLORS[0]);
    const [errors, setErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useI18n();
    const { success, error } = useToast();

    const validateForm = (): boolean => {
        const validation = validateClient({ name, color });
        if (!validation.success) {
            setErrors(validation.errors);
            return false;
        }
        setErrors([]);
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        try {
            await onSave(name.trim(), color);
            success(initialClient ? t('toast.clientUpdated') : t('toast.clientAdded'));
            onClose();
        } catch {
            error(t('toast.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        if (errors.length > 0) {
            validateForm();
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {errors.length > 0 && (
                <div style={{
                    padding: '12px 16px',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '12px',
                    color: '#B91C1C',
                    fontSize: '0.875rem'
                }}>
                    {errors.map((error, index) => (
                        <div key={index}>{error}</div>
                    ))}
                </div>
            )}

            <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {t('clientForm.nameLabel')}
                </label>
                <input
                    type="text"
                    placeholder={t('clientForm.namePlaceholder')}
                    value={name}
                    onChange={handleNameChange}
                    style={{ padding: '14px 16px' }}
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {t('clientForm.colorLabel')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
                    {CLIENT_COLORS.map(c => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setColor(c)}
                            disabled={isSubmitting}
                            style={{
                                width: '100%',
                                paddingTop: '100%',
                                position: 'relative',
                                borderRadius: '12px',
                                backgroundColor: c,
                                border: color === c ? '3px solid var(--text-main)' : '2px solid transparent',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                opacity: isSubmitting ? 0.6 : 1,
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: color === c ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                                transform: color === c ? 'scale(1.05)' : 'none'
                            }}
                        >
                            <span style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {color === c && <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }} />}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{
                    marginTop: '12px',
                    background: 'var(--text-main)',
                    color: 'white',
                    padding: '16px',
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
            >
                {isSubmitting ? 'Saving...' : (initialClient ? t('clientForm.saveChanges') : t('clientForm.addClient'))}
            </button>
        </form>
    );
}
