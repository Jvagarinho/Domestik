import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = '500px' }: ModalProps) {
    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            minHeight: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '60px 16px',
            backdropFilter: 'blur(4px)',
        }} onClick={onClose}>
            <div
                className="card"
                style={{ 
                    width: '100%', 
                    maxWidth: maxWidth, 
                    position: 'relative',
                    borderRadius: '16px',
                    backgroundColor: 'white',
                    marginTop: '20px',
                    marginBottom: '20px',
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '20px',
                    borderBottom: '1px solid #E5E7EB',
                }}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{title}</h2>
                    <button 
                        onClick={onClose} 
                        style={{ 
                            background: 'none', 
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px',
                        }}
                        aria-label="Close modal"
                    >
                        <X size={24} color="#666" />
                    </button>
                </div>
                <div style={{ padding: '20px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
