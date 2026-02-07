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

    // Check if mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: isMobile ? '0' : '20px',
            backdropFilter: 'blur(4px)',
        }} onClick={onClose}>
            <div
                className="card animate-fade-in"
                style={{ 
                    width: '100%', 
                    maxWidth: isMobile ? '100%' : maxWidth, 
                    position: 'relative',
                    borderRadius: isMobile ? '20px 20px 0 0' : '16px',
                    margin: isMobile ? '0' : '20px',
                    maxHeight: isMobile ? '90vh' : 'calc(100vh - 40px)',
                    overflow: 'auto',
                    animation: isMobile ? 'slide-up 0.3s ease-out' : 'fadeIn 0.3s ease-out',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Handle bar for mobile */}
                {isMobile && (
                    <div style={{
                        width: '40px',
                        height: '4px',
                        backgroundColor: '#E5E7EB',
                        borderRadius: '2px',
                        margin: '0 auto 16px',
                    }} />
                )}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '20px',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'white',
                    zIndex: 1,
                }}>
                    <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', margin: 0 }}>{title}</h2>
                    <button 
                        onClick={onClose} 
                        style={{ 
                            background: 'none', 
                            padding: '8px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '44px',
                            minHeight: '44px',
                        }}
                        aria-label="Close modal"
                    >
                        <X size={24} color="#666" />
                    </button>
                </div>
                {children}
            </div>
            <style>{`
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
