import { useState } from 'react';
import type { Client, Service } from '../types';
import { useI18n } from '../i18n';
import { validateService } from '../lib/validation';
import { useToast } from '../hooks/useToast';

interface ServiceFormProps {
    clients: Client[];
    initialData?: Service;
    onSave: (service: Omit<Service, 'id' | 'created_at'>) => Promise<void>;
    onClose: () => void;
}

export function ServiceForm({ clients, initialData, onSave, onClose }: ServiceFormProps) {
    const [formData, setFormData] = useState({
        date: initialData?.date || new Date().toISOString().split('T')[0],
        client_id: initialData?.client_id || '',
        time_worked: initialData?.time_worked || 4,
        hourly_rate: initialData?.hourly_rate || 25,
    });
    const [errors, setErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { t, language } = useI18n();
    const { success, error } = useToast();
    const currencySymbol = language === 'pt' ? '€' : '$';

    const total = formData.time_worked * formData.hourly_rate;

    const validateForm = (): boolean => {
        const validation = validateService({
            ...formData,
            total
        });
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
            await onSave({
                ...formData,
                total
            });
            success(initialData ? t('toast.serviceUpdated') : t('toast.serviceAdded'));
            onClose();
        } catch {
            error(t('toast.error'));
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: keyof typeof formData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear errors when user starts typing
        if (errors.length > 0) {
            setErrors([]);
        }
    };

    const hasClientError = errors.some(e => e.toLowerCase().includes('client'));

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                    {t('serviceForm.dateLabel')}
                </label>
                <input
                    type="date"
                    value={formData.date}
                    onChange={e => handleChange('date', e.target.value)}
                    disabled={isSubmitting}
                    style={{ cursor: isSubmitting ? 'not-allowed' : 'text' }}
                    required
                />
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                    {t('serviceForm.clientLabel')}
                </label>
                <select
                    value={formData.client_id}
                    onChange={e => handleChange('client_id', e.target.value)}
                    disabled={isSubmitting}
                    style={{ 
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        borderColor: hasClientError ? '#EF4444' : undefined
                    }}
                    required
                >
                    <option value="">{t('serviceForm.clientPlaceholder')}</option>
                    {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                {hasClientError && (
                    <span style={{ fontSize: '0.8rem', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                        {t('serviceForm.selectClientAlert')}
                    </span>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                        {t('serviceForm.hoursLabel')}
                    </label>
                    <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="24"
                        value={formData.time_worked}
                        onChange={e => handleChange('time_worked', parseFloat(e.target.value) || 0)}
                        disabled={isSubmitting}
                        style={{ cursor: isSubmitting ? 'not-allowed' : 'text' }}
                        required
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                        {t('serviceForm.rateLabel')}
                    </label>
                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={formData.hourly_rate}
                        onChange={e => handleChange('hourly_rate', parseFloat(e.target.value) || 0)}
                        disabled={isSubmitting}
                        style={{ cursor: isSubmitting ? 'not-allowed' : 'text' }}
                        required
                    />
                </div>
            </div>

            <div style={{
                marginTop: '8px',
                padding: '16px',
                backgroundColor: 'var(--bg-off-white)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ fontWeight: 600 }}>{t('serviceForm.totalLabel')}</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2F4F4F' }}>
                    {currencySymbol}
                    {total.toFixed(2)}
                </span>
            </div>

            <button 
                type="submit" 
                className="btn-primary" 
                disabled={isSubmitting}
                style={{ 
                    marginTop: '8px',
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
            >
                {isSubmitting ? 'Saving...' : t('serviceForm.save')}
            </button>
        </form>
    );
}
