import { DollarSign, Clock, Calendar } from 'lucide-react';
import type { Service } from '../types';

interface DashboardProps {
    services: Service[];
}

export function Dashboard({ services }: DashboardProps) {
    const totalEarnings = services.reduce((sum, s) => sum + s.total, 0);
    const totalHours = services.reduce((sum, s) => sum + s.time_worked, 0);
    const serviceCount = services.length;

    return (
        <div className="dashboard-grid">
            <div className="card" style={{ background: 'var(--financial-peach)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(0,0,0,0.5)' }}>MONTHLY EARNINGS</span>
                    <DollarSign size={18} color="rgba(0,0,0,0.4)" />
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>${totalEarnings.toFixed(2)}</span>
            </div>

            <div className="card" style={{ background: 'var(--secondary-sky)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(0,0,0,0.5)' }}>TOTAL HOURS</span>
                    <Clock size={18} color="rgba(0,0,0,0.4)" />
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalHours}h</span>
            </div>

            <div className="card" style={{ background: 'var(--primary-mint)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(0,0,0,0.5)' }}>SERVICES</span>
                    <Calendar size={18} color="rgba(0,0,0,0.4)" />
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{serviceCount}</span>
            </div>
        </div>
    );
}
