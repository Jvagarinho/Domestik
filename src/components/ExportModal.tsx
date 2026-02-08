
import { Download, FileText, Table, X } from 'lucide-react';
import type { Service, Client } from '../types';
import { exportToExcel, exportToPDF } from '../lib/export';
import { useI18n } from '../i18n';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    services: Service[];
    clients: Client[];
    selectedDate: Date;
    language: 'en' | 'pt';
    filterClient?: string;
    startDate?: string;
    endDate?: string;
    minValue?: string;
    maxValue?: string;
    getClientName?: (id: string) => string;
}

export function ExportModal({ isOpen, onClose, services, clients, selectedDate, language, filterClient, startDate, endDate, minValue, maxValue, getClientName }: ExportModalProps) {
    const { t } = useI18n();

    if (!isOpen) return null;

    const handleExportExcel = () => {
        exportToExcel(services, clients, language, selectedDate, {
            filterClient,
            startDate,
            endDate,
            minValue,
            maxValue,
            getClientName
        });
        onClose();
    };

    const handleExportPDF = () => {
        exportToPDF(services, clients, language, selectedDate, {
            filterClient,
            startDate,
            endDate,
            minValue,
            maxValue,
            getClientName
        });
        onClose();
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
            }}
            onClick={onClose}
        >
            <div
                className="card"
                style={{
                    maxWidth: '400px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    animation: 'slideUp 0.2s ease-out'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{t('export.title')}</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: 'var(--text-muted)'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    {t('export.description')}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        onClick={handleExportExcel}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            background: 'var(--white)',
                            border: '2px solid #E5E7EB',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.95rem',
                            fontWeight: 500
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--secondary-sky)';
                            e.currentTarget.style.background = '#F8F9FA';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E5E7EB';
                            e.currentTarget.style.background = 'var(--white)';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: '#10B981', borderRadius: '10px', color: 'white' }}>
                            <Table size={22} />
                        </div>
                        <div style={{ textAlign: 'left', flex: 1 }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t('export.excel')}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{t('export.excelDesc')}</div>
                        </div>
                        <Download size={18} color="var(--text-muted)" />
                    </button>

                    <button
                        onClick={handleExportPDF}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            background: 'var(--white)',
                            border: '2px solid #E5E7EB',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.95rem',
                            fontWeight: 500
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--secondary-sky)';
                            e.currentTarget.style.background = '#F8F9FA';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E5E7EB';
                            e.currentTarget.style.background = 'var(--white)';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: '#EF4444', borderRadius: '10px', color: 'white' }}>
                            <FileText size={22} />
                        </div>
                        <div style={{ textAlign: 'left', flex: 1 }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t('export.pdf')}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{t('export.pdfDesc')}</div>
                        </div>
                        <Download size={18} color="var(--text-muted)" />
                    </button>
                </div>
            </div>
        </div>
    );
}
