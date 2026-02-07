import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useI18n } from '../i18n';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const variantStyles = {
  danger: {
    icon: AlertTriangle,
    iconBg: '#FEF2F2',
    iconColor: '#DC2626',
    buttonBg: '#DC2626',
    buttonHover: '#B91C1C',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: '#FFFBEB',
    iconColor: '#D97706',
    buttonBg: '#D97706',
    buttonHover: '#B45309',
  },
  info: {
    icon: CheckCircle,
    iconBg: '#F0F9FF',
    iconColor: '#0284C7',
    buttonBg: '#0284C7',
    buttonHover: '#0369A1',
  },
};

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { t } = useI18n();
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'modal-slide-in 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: styles.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={24} color={styles.iconColor} />
          </div>
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '8px',
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: '0.95rem',
                color: '#6B7280',
                lineHeight: 1.5,
              }}
            >
              {message}
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '24px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F9FAFB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            {cancelText || t('confirmModal.cancel')}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: styles.buttonBg,
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = styles.buttonHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = styles.buttonBg;
            }}
          >
            {confirmText || t('confirmModal.confirm')}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modal-slide-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Hook for managing confirm modal state
import { useState, useCallback } from 'react';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  variant?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
}

export function useConfirmModal() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const confirm = useCallback(
    (options: Omit<ConfirmState, 'isOpen' | 'onConfirm'>): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({
          ...options,
          isOpen: true,
          onConfirm: () => {
            resolve(true);
            setState((prev) => ({ ...prev, isOpen: false }));
          },
        });
      });
    },
    []
  );

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const ConfirmModalComponent = useCallback(
    () => (
      <ConfirmModal
        isOpen={state.isOpen}
        title={state.title}
        message={state.message}
        variant={state.variant}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        onConfirm={state.onConfirm}
        onCancel={close}
      />
    ),
    [state, close]
  );

  return {
    confirm,
    close,
    ConfirmModal: ConfirmModalComponent,
  };
}
