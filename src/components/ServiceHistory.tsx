import { useState } from 'react';
import type { Service, Client } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Filter, Trash2, Edit2 } from 'lucide-react';
import { useI18n } from '../i18n';
import { useToast } from '../hooks/useToast';
import { useConfirmModal } from './ConfirmModal';

interface ServiceHistoryProps {
    services: Service[];
    clients: Client[];
    onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
    onEdit: (service: Service) => void;
}

export function ServiceHistory({ services, clients, onDelete, onEdit }: ServiceHistoryProps) {
    const [filterClient, setFilterClient] = useState('');
    const { t, language } = useI18n();
    const { success, error } = useToast();
    const { confirm, ConfirmModal } = useConfirmModal();
    const currencySymbol = language === 'pt' ? '€' : '$';

    const filteredServices = filterClient
        ? services.filter(s => s.client_id === filterClient)
        : services;

    // Group by month (localized)
    const groups: { [key: string]: Service[] } = {};
    filteredServices.forEach(s => {
        const month = format(parseISO(s.date), 'MMMM yyyy', {
            locale: language === 'pt' ? ptBR : undefined
        });
        if (!groups[month]) groups[month] = [];
        groups[month].push(s);
    });

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            title: t('history.title'),
            message: t('history.confirmDelete'),
            variant: 'danger',
        });
        if (!confirmed) return;
        
        const result = await onDelete(id);
        if (result.success) {
            success(t('toast.serviceDeleted'));
        } else {
            error(result.error || t('toast.error'));
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem' }}>{t('history.title')}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={18} color="#666" />
                    <select
                        value={filterClient}
                        onChange={e => setFilterClient(e.target.value)}
                        style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                    >
                        <option value="">{t('history.allClients')}</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            {Object.keys(groups).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <p style={{ fontStyle: 'italic' }}>{t('history.empty')}</p>
                </div>
            ) : (
                Object.entries(groups).map(([month, monthServices]) => (
                    <div key={month} style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px', borderBottom: '1px solid #EEE', paddingBottom: '4px' }}>
                            {month}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {monthServices.map(s => (
                                <div key={s.id} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
                                    <div style={{
                                        width: '4px',
                                        height: '40px',
                                        backgroundColor: s.client?.color || 'var(--secondary-sky)',
                                        borderRadius: '2px'
                                    }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                            <span style={{ fontWeight: 600 }}>{s.client?.name || 'Unknown Client'}</span>
                                            <span style={{ fontWeight: 700, color: '#2F4F4F' }}>
                                                {currencySymbol}
                                                {s.total.toFixed(2)}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            <span>
                                                {format(
                                                    parseISO(s.date),
                                                    language === 'pt' ? 'd MMM yyyy' : 'MMM d, yyyy'
                                                )}
                                            </span>
                                            <span>
                                                {s.time_worked}h @ {currencySymbol}
                                                {s.hourly_rate}
                                                /{language === 'pt' ? 'h' : 'hr'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => onEdit(s)}
                                            style={{
                                                background: 'none',
                                                color: 'var(--primary-mint)',
                                                padding: '12px',
                                                cursor: 'pointer',
                                                border: 'none',
                                                borderRadius: '999px',
                                                minWidth: '44px',
                                                minHeight: '44px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            aria-label="Edit service"
                                        >
                                            <Edit2 size={22} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(s.id)}
                                            style={{
                                                background: 'none',
                                                color: '#ff4d4d',
                                                padding: '12px',
                                                cursor: 'pointer',
                                                border: 'none',
                                                borderRadius: '999px',
                                                minWidth: '44px',
                                                minHeight: '44px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            aria-label="Delete service"
                                        >
                                            <Trash2 size={22} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
            <ConfirmModal />
        </div>
    );
}
