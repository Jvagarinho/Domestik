import { useState } from 'react';
import type { Client, Service } from '../types';

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

    const total = formData.time_worked * formData.hourly_rate;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.client_id) return alert('Please select a client');

        await onSave({
            ...formData,
            total
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Date</label>
                <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    required
                />
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Client</label>
                <select
                    value={formData.client_id}
                    onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                    required
                >
                    <option value="">Select a client</option>
                    {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Hours</label>
                    <input
                        type="number"
                        step="0.5"
                        value={formData.time_worked}
                        onChange={e => setFormData({ ...formData, time_worked: parseFloat(e.target.value) })}
                        required
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Rate ($/hr)</label>
                    <input
                        type="number"
                        value={formData.hourly_rate}
                        onChange={e => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
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
                <span style={{ fontWeight: 600 }}>Total for the Day</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2F4F4F' }}>${total.toFixed(2)}</span>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                Save Service
            </button>
        </form>
    );
}
