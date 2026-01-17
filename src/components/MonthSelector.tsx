import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import { useI18n } from '../i18n';

interface MonthSelectorProps {
    selectedDate: Date;
    onChange: (date: Date) => void;
}

export function MonthSelector({ selectedDate, onChange }: MonthSelectorProps) {
    const { t, language } = useI18n();
    const handlePrev = () => onChange(subMonths(selectedDate, 1));
    const handleNext = () => onChange(addMonths(selectedDate, 1));
    const handleCurrent = () => onChange(new Date());

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            background: 'white',
            padding: '12px 16px',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-soft)',
            border: '1px solid #F3F4F6'
        }}>
            <button
                onClick={handlePrev}
                style={{
                    background: '#F9FAFB',
                    padding: '12px',
                    borderRadius: '12px',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    border: 'none',
                    cursor: 'pointer'
                }}
                aria-label={t('month.prev')}
            >
                <ChevronLeft size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={handleCurrent}>
                <CalendarDays size={20} color="var(--primary-emerald)" />
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                    {format(selectedDate, 'MMMM yyyy', { locale: language === 'pt' ? ptBR : undefined })}
                </span>
            </div>

            <button
                onClick={handleNext}
                style={{
                    background: '#F9FAFB',
                    padding: '12px',
                    borderRadius: '12px',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    border: 'none',
                    cursor: 'pointer'
                }}
                aria-label={t('month.next')}
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
}
