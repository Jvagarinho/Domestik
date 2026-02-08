import { useState, useEffect } from 'react';
import { Users, LogOut, LayoutDashboard, BarChart3 } from 'lucide-react';
import { useClients, useServices } from './hooks/useData';
import { Dashboard } from './components/Dashboard';
import { DashboardAdvanced } from './components/DashboardAdvanced';
import { ServiceHistory } from './components/ServiceHistory';
import { Modal } from './components/Modal';
import { ServiceForm } from './components/ServiceForm';
import { ClientForm } from './components/ClientForm';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Login } from './components/Login';
import { MonthSelector } from './components/MonthSelector';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import type { Service, Client } from './types';
import { isSupabaseConfigured } from './lib/supabase';
import { I18nProvider, useI18n } from './i18n';
import { ToastProvider, useToast } from './hooks/useToast';
import { Loading, CardSkeleton, DashboardSkeleton } from './components/Loading';
import { useConfirmModal } from './components/ConfirmModal';

function AppContent() {
  const { clients, loading: clientsLoading, addClient, updateClient, archiveClient } = useClients();
  const { services, loading: servicesLoading, addService, updateService, deleteService, fetchServices } = useServices();
  const { user, isAdmin, signOut, loading } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const { success, error } = useToast();
  const { confirm, ConfirmModal } = useConfirmModal();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [activePage, setActivePage] = useState<'dashboard' | 'clients' | 'charts'>('dashboard');
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);
  const currencySymbol = language === 'pt' ? '€' : '$';

  useEffect(() => {
    if (user) {
      const start = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(selectedDate), 'yyyy-MM-dd');
      fetchServices(undefined, start, end);
    }
  }, [user, selectedDate]);

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
  };

  const handleCloseServiceModal = () => {
    setIsServiceModalOpen(false);
    setEditingService(undefined);
  };

  const handleOpenNewClient = () => {
    setEditingClient(undefined);
    setIsClientModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsClientModalOpen(true);
  };

  const handleArchiveClient = async (client: Client) => {
    const confirmed = await confirm({
      title: t('clients.archivePrefix'),
      message: `${t('clients.archivePrefix')} ${client.name}?`,
      variant: 'warning',
      confirmText: t('clients.archivePrefix'),
    });
    if (!confirmed) return;
    const result = await archiveClient(client.id);
    if (result.success) {
      success(t('toast.clientArchived'));
    } else {
      error(t('toast.error'));
    }
  };

  if (loading) {
    return <Loading fullScreen size="lg" text={t('app.loading')} />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="container animate-fade-in">
      <header style={{ padding: '24px 0', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: '#2F4F4F', letterSpacing: '-0.02em' }}>Domestik</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {t('app.welcomePrefix')} <strong>{user.email?.split('@')[0]}</strong>!
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
            style={{
              background: 'var(--white)',
              border: '1px solid #E5E7EB',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              fontWeight: 500,
              padding: '10px 16px',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-soft)'
            }}
            aria-label={language === 'pt' ? 'Mudar para inglês' : 'Switch to Portuguese'}
          >
            {language === 'pt' ? 'EN' : 'PT'}
          </button>
          <button
            onClick={() => signOut()}
            style={{
              background: 'var(--white)',
              border: '1px solid #E5E7EB',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              fontWeight: 500,
              padding: '10px 16px',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-soft)'
            }}
          >
            <LogOut size={18} style={{ marginRight: '8px' }} />
            {t('header.signOut')}
          </button>
        </div>
      </header>

      {isAdmin && (
        <>
          <div className="desktop-tabs">
            <button
              onClick={() => setActivePage('dashboard')}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '999px',
                border: '1px solid #E5E7EB',
                background: activePage === 'dashboard' ? 'var(--text-main)' : 'var(--white)',
                color: activePage === 'dashboard' ? 'white' : 'var(--text-main)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {t('nav.overview')}
            </button>
            <button
              onClick={() => setActivePage('clients')}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '999px',
                border: '1px solid #E5E7EB',
                background: activePage === 'clients' ? 'var(--text-main)' : 'var(--white)',
                color: activePage === 'clients' ? 'white' : 'var(--text-main)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {t('nav.clients')}
            </button>
            <button
              onClick={() => setActivePage('charts')}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '999px',
                border: '1px solid #E5E7EB',
                background: activePage === 'charts' ? 'var(--text-main)' : 'var(--white)',
                color: activePage === 'charts' ? 'white' : 'var(--text-main)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {t('nav.charts')}
            </button>
          </div>

          <div className="bottom-nav">
            <button
              className={`bottom-nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActivePage('dashboard')}
            >
              <LayoutDashboard size={24} />
              <span>{t('nav.overview')}</span>
            </button>
            <button
              className={`bottom-nav-item ${activePage === 'clients' ? 'active' : ''}`}
              onClick={() => setActivePage('clients')}
            >
              <Users size={24} />
              <span>{t('nav.clients')}</span>
            </button>
            <button
              className={`bottom-nav-item ${activePage === 'charts' ? 'active' : ''}`}
              onClick={() => setActivePage('charts')}
            >
              <BarChart3 size={24} />
              <span>{t('nav.charts')}</span>
            </button>
          </div>
        </>
      )}

      <MonthSelector selectedDate={selectedDate} onChange={setSelectedDate} />

      {activePage === 'dashboard' && (
        <>
          {servicesLoading ? <DashboardSkeleton /> : <Dashboard services={services} />}

          {!isAdmin && (
        <div className="card" style={{ marginBottom: '24px', background: '#F0F9FF', border: '1px solid #BAE6FD', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ padding: '10px', background: '#7DD3FC', borderRadius: '10px', color: 'white' }}>
            <Users size={20} />
          </div>
          <div>
            <p style={{ fontWeight: 600, color: '#0369A1', fontSize: '0.95rem' }}>{t('viewOnly.title')}</p>
            <p style={{ color: '#075985', fontSize: '0.85rem' }}>{t('viewOnly.description')}</p>
          </div>
        </div>
          )}

          {isAdmin && (
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <button
            onClick={handleOpenNewClient}
            className="card"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
              background: 'var(--white)',
              color: 'var(--text-main)',
              fontWeight: 600,
              cursor: 'pointer',
              border: '2px dashed var(--secondary-sky)'
            }}
          >
            <Users size={22} color="var(--primary-indigo)" />
            {t('dashboard.addNewClient')}
          </button>
        </div>
          )}

          <ServiceHistory
            services={services}
            clients={clients}
            onDelete={deleteService}
            onEdit={handleEditService}
            onAdd={isAdmin ? () => setIsServiceModalOpen(true) : undefined}
            selectedDate={selectedDate}
          />
        </>
      )}

      {activePage === 'clients' && isAdmin && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem' }}>{t('clients.title')}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('clients.subtitle')}</p>
            </div>
            <button
              onClick={handleOpenNewClient}
              style={{
                padding: '8px 12px',
                borderRadius: '999px',
                border: '1px solid #E5E7EB',
                background: 'var(--white)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500
              }}
            >
              {t('clients.addButton')}
            </button>
          </div>
          {clientsLoading ? (
            <CardSkeleton count={5} />
          ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {clients.map((client) => {
              const stats = services.reduce(
                (acc, s) => s.client_id === client.id
                  ? {
                      total: acc.total + s.total,
                      hours: acc.hours + s.time_worked,
                      count: acc.count + 1
                    }
                  : acc,
                { total: 0, hours: 0, count: 0 }
              );

              return (
                <div key={client.id} className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '999px', background: client.color }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{client.name}</span>
                      <span style={{ fontWeight: 700 }}>
                        {currencySymbol}
                        {stats.total.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>
                        {stats.count} {t('clients.stats.servicesSuffix')}
                      </span>
                      <span>
                        {stats.hours}
                        {t('clients.stats.hoursSuffix')}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleEditClient(client)}
                      style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '999px', border: '1px solid #E5E7EB', background: 'var(--white)', cursor: 'pointer' }}
                    >
                      {t('clients.editButton')}
                    </button>
                    <button
                      onClick={() => handleArchiveClient(client)}
                      style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '999px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#B91C1C', cursor: 'pointer' }}
                    >
                      {t('clients.archiveButton')}
                    </button>
                  </div>
                </div>
              );
            })}
            {clients.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {t('clients.empty')}
              </div>
            )}
          </div>
          )}
        </div>
      )}

      {activePage === 'charts' && (
        <div style={{ marginBottom: '24px' }}>
          {servicesLoading ? <DashboardSkeleton /> : <DashboardAdvanced services={services} />}
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={isServiceModalOpen}
        onClose={handleCloseServiceModal}
        title={editingService ? t('modal.service.editTitle') : t('modal.service.newTitle')}
      >
        <ServiceForm
          clients={clients}
          initialData={editingService}
          onSave={async (s) => {
            if (editingService) {
              const result = await updateService(editingService.id, s);
              if (!result.success) {
                throw new Error(result.error);
              }
            } else {
              const result = await addService(s);
              if (!result.success) {
                throw new Error(result.error);
              }
            }
            // Refetch services to ensure we only show services for the selected month
            const start = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
            const end = format(endOfMonth(selectedDate), 'yyyy-MM-dd');
            await fetchServices(undefined, start, end);
          }}
          onClose={handleCloseServiceModal}
        />
      </Modal>

      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title={editingClient ? t('modal.client.editTitle') : t('modal.client.newTitle')}
      >
        <ClientForm
          initialClient={editingClient}
          onSave={async (n, c) => {
            if (editingClient) {
              const result = await updateClient(editingClient.id, { name: n, color: c });
              if (!result.success) {
                throw new Error(result.error);
              }
            } else {
              const result = await addClient(n, c);
              if (!result.success) {
                throw new Error(result.error);
              }
            }
          }}
          onClose={() => setIsClientModalOpen(false)}
        />
      </Modal>

      <ConfirmModal />
    </div>
  );
}

function RootApp() {
  const { t } = useI18n();

  if (!isSupabaseConfigured) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f9f9f9'
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px',
            width: '90%'
          }}
        >
          <h1 style={{ color: '#ef4444', marginBottom: '16px', fontSize: '1.5rem' }}>{t('config.missingTitle')}</h1>
          <p style={{ color: '#4b5563', marginBottom: '16px', lineHeight: 1.5 }}>
            {t('config.missingBody')}
          </p>
          <div
            style={{
              background: '#f3f4f6',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              overflowX: 'auto'
            }}
          >
            VITE_SUPABASE_URL=...<br />
            VITE_SUPABASE_ANON_KEY=...
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            {t('config.missingFooter')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

function App() {
  return (
    <I18nProvider>
      <RootApp />
    </I18nProvider>
  );
}

export default App;
