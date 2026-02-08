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
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

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
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            backdropFilter: 'blur(4px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
        }} onClick={onClose}>
            <div
                className="card"
                style={{ 
                    width: '100%', 
                    maxWidth: maxWidth, 
                    position: 'relative',
                    borderRadius: '16px',
                    margin: 'auto',
                    maxHeight: '85vh',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    WebkitOverflowScrolling: 'touch',
                    backgroundColor: 'white',
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '20px',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'white',
                    zIndex: 10,
                    padding: '20px 20px 0 20px',
                    margin: '-20px -20px 20px -20px',
                }}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0, padding: '20px 0 0 20px' }}>{title}</h2>
                    <button 
                        onClick={onClose} 
                        style={{ 
                            background: 'none', 
                            border: 'none',
                            padding: '20px 20px 0 0',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        aria-label="Close modal"
                    >
                        <X size={24} color="#666" />
                    </button>
                </div>
                <div style={{ padding: '0 20px 20px 20px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
