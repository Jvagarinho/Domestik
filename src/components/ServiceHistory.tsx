import { useState } from 'react';
import type { Service, Client } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Filter, Trash2, Edit2, ChevronDown, ChevronUp, X, Download, Plus } from 'lucide-react';
import { useI18n } from '../i18n';
import { useToast } from '../hooks/useToast';
import { useConfirmModal } from './ConfirmModal';
import { ExportModal } from './ExportModal';

type SortField = 'date' | 'value' | 'client';
type SortOrder = 'asc' | 'desc';

interface ServiceHistoryProps {
    services: Service[];
    clients: Client[];
    onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
    onEdit: (service: Service) => void;
    onAdd?: () => void;
    selectedDate: Date;
}

export function ServiceHistory({ services, clients, onDelete, onEdit, onAdd, selectedDate }: ServiceHistoryProps) {
    const [filterClient, setFilterClient] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minValue, setMinValue] = useState('');
    const [maxValue, setMaxValue] = useState('');
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [showFilters, setShowFilters] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const { t, language } = useI18n();
    const { success, error } = useToast();
    const { confirm, ConfirmModal } = useConfirmModal();
    const currencySymbol = language === 'pt' ? '€' : '$';

    // Apply all filters
    let filteredServices = [...services];

    // Filter by client
    if (filterClient) {
        filteredServices = filteredServices.filter(s => s.client_id === filterClient);
    }

    // Filter by date range
    if (startDate) {
        filteredServices = filteredServices.filter(s => s.date >= startDate);
    }
    if (endDate) {
        filteredServices = filteredServices.filter(s => s.date <= endDate);
    }

    // Filter by value range
    if (minValue) {
        filteredServices = filteredServices.filter(s => s.total >= parseFloat(minValue));
    }
    if (maxValue) {
        filteredServices = filteredServices.filter(s => s.total <= parseFloat(maxValue));
    }

    // Sort services
    filteredServices.sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
            case 'date':
                comparison = a.date.localeCompare(b.date);
                break;
            case 'value':
                comparison = a.total - b.total;
                break;
            case 'client': {
                const clientA = clients.find(c => c.id === a.client_id)?.name || '';
                const clientB = clients.find(c => c.id === b.client_id)?.name || '';
                comparison = clientA.localeCompare(clientB);
                break;
            }
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Group by month (localized)
    const groups: { [key: string]: Service[] } = {};
    filteredServices.forEach(s => {
const month = format(parseISO(s.date), 'MMMM yyyy', {
            locale: language === 'pt' ? ptBR : undefined
        }).replace(/^[a-z]/, (char) => char.toUpperCase());
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

    const hasActiveFilters = filterClient || startDate || endDate || minValue || maxValue;

    const clearAllFilters = () => {
        setFilterClient('');
        setStartDate('');
        setEndDate('');
        setMinValue('');
        setMaxValue('');
        setSortField('date');
        setSortOrder('desc');
    };

    return (
        <div className="animate-fade-in">
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem' }}>{t('history.title')}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {onAdd && (
                        <button
                            onClick={onAdd}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#10B981',
                                color: 'white',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            <Plus size={18} />
                            {t('fab.registerNewDay')}
                        </button>
                    )}
                    <button
                        onClick={() => setShowExportModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            background: 'white',
                            color: '#666',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                        }}
                    >
                        <Download size={16} />
                        {t('export.button')}
                    </button>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            background: hasActiveFilters ? '#F0FDF4' : 'white',
                            color: hasActiveFilters ? '#10B981' : '#666',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                        }}
                    >
                        <Filter size={16} />
                        {t('history.filters')}
                        {hasActiveFilters && <span style={{ 
                            background: '#10B981', 
                            color: 'white', 
                            borderRadius: '50%', 
                            width: '18px', 
                            height: '18px', 
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>!</span>}
                    </button>
                </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
                <div style={{ 
                    background: 'white', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    marginBottom: '16px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    {/* Client Filter */}
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
                            {t('history.filterClient')}
                        </label>
                        <select
                            value={filterClient}
                            onChange={e => setFilterClient(e.target.value)}
                            style={{ padding: '8px', fontSize: '0.85rem', width: '100%' }}
                        >
                            <option value="">{t('history.allClients')}</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* Date Range Filter */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
                                {t('history.fromDate')}
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                style={{ padding: '8px', fontSize: '0.85rem', width: '100%' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
                                {t('history.toDate')}
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                style={{ padding: '8px', fontSize: '0.85rem', width: '100%' }}
                            />
                        </div>
                    </div>

                    {/* Value Range Filter */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
                                {t('history.minValue')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={minValue}
                                onChange={e => setMinValue(e.target.value)}
                                placeholder={currencySymbol}
                                style={{ padding: '8px', fontSize: '0.85rem', width: '100%' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
                                {t('history.maxValue')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={maxValue}
                                onChange={e => setMaxValue(e.target.value)}
                                placeholder={currencySymbol}
                                style={{ padding: '8px', fontSize: '0.85rem', width: '100%' }}
                            />
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', marginBottom: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
                                {t('history.sortBy')}
                            </label>
                            <select
                                value={sortField}
                                onChange={e => setSortField(e.target.value as SortField)}
                                style={{ padding: '8px', fontSize: '0.85rem', width: '100%' }}
                            >
                                <option value="date">{t('history.sortDate')}</option>
                                <option value="value">{t('history.sortValue')}</option>
                                <option value="client">{t('history.sortClient')}</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
                                {t('history.order')}
                            </label>
                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '6px',
                                    background: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.85rem'
                                }}
                            >
                                {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                {sortOrder === 'asc' ? t('history.ascending') : t('history.descending')}
                            </button>
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '8px 12px',
                                border: '1px solid #FCA5A5',
                                borderRadius: '6px',
                                background: '#FEF2F2',
                                color: '#DC2626',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                width: '100%',
                                justifyContent: 'center'
                            }}
                        >
                            <X size={16} />
                            {t('history.clearFilters')}
                        </button>
                    )}
                </div>
            )}

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
            <ExportModal 
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                services={filteredServices}
                clients={clients}
                selectedDate={selectedDate}
                language={language}
                filterClient={filterClient}
                startDate={startDate}
                endDate={endDate}
                minValue={minValue}
                maxValue={maxValue}
                getClientName={(id) => clients.find(c => c.id === id)?.name || 'Unknown Client'}
            />
        </div>
    );
}
