import React, { useState } from 'react';

interface ClientFormProps {
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

export function ClientForm({ onSave, onClose }: ClientFormProps) {
    const [name, setName] = useState('');
    const [color, setColor] = useState(CLIENT_COLORS[0]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        await onSave(name, color);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Client Name</label>
                <input
                    type="text"
                    placeholder="e.g. Maria Silva"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    style={{ padding: '14px 16px' }}
                />
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Identify with Color</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
                    {CLIENT_COLORS.map(c => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setColor(c)}
                            style={{
                                width: '100%',
                                paddingTop: '100%',
                                position: 'relative',
                                borderRadius: '12px',
                                backgroundColor: c,
                                border: color === c ? '3px solid var(--text-main)' : '2px solid transparent',
                                cursor: 'pointer',
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
                style={{
                    marginTop: '12px',
                    background: 'var(--text-main)',
                    color: 'white',
                    padding: '16px'
                }}
            >
                Add Client
            </button>
        </form>
    );
}
