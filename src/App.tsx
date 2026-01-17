import { useState, useEffect } from 'react';
import { Plus, Users, LogOut } from 'lucide-react';
import { useClients, useServices } from './hooks/useData';
import { Dashboard } from './components/Dashboard';
import { ServiceHistory } from './components/ServiceHistory';
import { Modal } from './components/Modal';
import { ServiceForm } from './components/ServiceForm';
import { ClientForm } from './components/ClientForm';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Login } from './components/Login';
import { MonthSelector } from './components/MonthSelector';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import type { Service, Client } from './types';

function AppContent() {
  const { clients, addClient, updateClient, archiveClient } = useClients();
  const { services, addService, updateService, fetchServices } = useServices();
  const { user, isAdmin, signOut, loading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [activePage, setActivePage] = useState<'dashboard' | 'clients'>('dashboard');
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);

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
    if (!confirm(`Archive ${client.name}?`)) return;
    await archiveClient(client.id);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary-mint)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Initializing Domestik...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="container animate-fade-in">
      <header style={{ padding: '24px 0', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: '#2F4F4F', letterSpacing: '-0.02em' }}>Domestik</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Welcome back, <strong>{user.email?.split('@')[0]}</strong>!</p>
        </div>
        <button
          onClick={() => signOut()}
          style={{
            background: 'var(--white)',
            border: '1px solid #E5E7EB',
            color: 'var(--text-main)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            padding: '10px 16px',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-soft)'
          }}
        >
          <LogOut size={18} /> Sign Out
        </button>
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
              Overview
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
              Clients
            </button>
          </div>

          <div className="bottom-nav">
            <button
              className={`bottom-nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActivePage('dashboard')}
            >
              <LayoutDashboard size={24} />
              <span>Overview</span>
            </button>
            <button
              className={`bottom-nav-item ${activePage === 'clients' ? 'active' : ''}`}
              onClick={() => setActivePage('clients')}
            >
              <Users size={24} />
              <span>Clients</span>
            </button>
          </div>
        </>
      )}

      <MonthSelector selectedDate={selectedDate} onChange={setSelectedDate} />

      {activePage === 'dashboard' && (
        <>
          <Dashboard services={services} />

          {!isAdmin && (
        <div className="card" style={{ marginBottom: '24px', background: '#F0F9FF', border: '1px solid #BAE6FD', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ padding: '10px', background: '#7DD3FC', borderRadius: '10px', color: 'white' }}>
            <Users size={20} />
          </div>
          <div>
            <p style={{ fontWeight: 600, color: '#0369A1', fontSize: '0.95rem' }}>View-Only Mode</p>
            <p style={{ color: '#075985', fontSize: '0.85rem' }}>Your account is being reviewed for admin privileges.</p>
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
            Add New Client
          </button>
        </div>
          )}

          <ServiceHistory
            services={services}
            clients={clients}
            onRefresh={fetchServices}
            onEdit={handleEditService}
          />

          {isAdmin && (
        <button
          className="fab"
          onClick={() => setIsServiceModalOpen(true)}
          aria-label="Register New Day"
        >
          <Plus size={32} />
        </button>
          )}
        </>
      )}

      {activePage === 'clients' && isAdmin && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem' }}>Clients</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Totals for the selected month</p>
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
              + Add Client
            </button>
          </div>
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
                      <span style={{ fontWeight: 700 }}>${stats.total.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>{stats.count} services</span>
                      <span>{stats.hours}h this month</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleEditClient(client)}
                      style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '999px', border: '1px solid #E5E7EB', background: 'var(--white)', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleArchiveClient(client)}
                      style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '999px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#B91C1C', cursor: 'pointer' }}
                    >
                      Archive
                    </button>
                  </div>
                </div>
              );
            })}
            {clients.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No clients yet. Add your first client to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={isServiceModalOpen}
        onClose={handleCloseServiceModal}
        title={editingService ? "Edit Service" : "Register New Day"}
      >
        <ServiceForm
          clients={clients}
          initialData={editingService}
          onSave={async (s) => {
            if (editingService) {
              await updateService(editingService.id, s);
            } else {
              await addService(s);
            }
          }}
          onClose={handleCloseServiceModal}
        />
      </Modal>

      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title={editingClient ? "Edit Client" : "Add New Client"}
      >
        <ClientForm
          initialClient={editingClient}
          onSave={async (n, c) => {
            if (editingClient) {
              await updateClient(editingClient.id, { name: n, color: c });
            } else {
              await addClient(n, c);
            }
          }}
          onClose={() => setIsClientModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
