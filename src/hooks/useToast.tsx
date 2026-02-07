import React, { createContext, useContext, useCallback } from 'react';
import toast, { Toaster, type ToastOptions } from 'react-hot-toast';

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  loading: (message: string) => string;
  dismiss: (toastId?: string) => void;
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => Promise<T>;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-center',
  style: {
    background: '#fff',
    color: '#363636',
    padding: '16px 20px',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    fontSize: '0.95rem',
    fontWeight: 500,
    maxWidth: '400px',
    border: '1px solid #E5E7EB'
  },
};

const successOptions: ToastOptions = {
  ...defaultOptions,
  iconTheme: {
    primary: '#10B981',
    secondary: '#fff',
  },
  style: {
    ...defaultOptions.style,
    border: '1px solid #10B981',
    background: '#F0FDF4',
  },
};

const errorOptions: ToastOptions = {
  ...defaultOptions,
  duration: 5000,
  iconTheme: {
    primary: '#EF4444',
    secondary: '#fff',
  },
  style: {
    ...defaultOptions.style,
    border: '1px solid #EF4444',
    background: '#FEF2F2',
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const success = useCallback((message: string) => {
    toast.success(message, successOptions);
  }, []);

  const error = useCallback((message: string) => {
    toast.error(message, errorOptions);
  }, []);

  const loading = useCallback((message: string): string => {
    return toast.loading(message, {
      ...defaultOptions,
      duration: Infinity,
    });
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }, []);

  const promise = useCallback(<T,>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ): Promise<T> => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        ...defaultOptions,
        success: successOptions,
        error: errorOptions,
      }
    );
  }, []);

  return (
    <ToastContext.Provider value={{ success, error, loading, dismiss, promise }}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={defaultOptions}
        containerStyle={{
          top: 20,
        }}
      />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
