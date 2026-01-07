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

function AppContent() {
  const { clients, addClient } = useClients();
  const { services, addService, fetchServices } = useServices();
  const { user, isAdmin, signOut, loading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const start = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(selectedDate), 'yyyy-MM-dd');
      fetchServices(undefined, start, end);
    }
  }, [user, selectedDate]);

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
      <header style={{ padding: '24px 0', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

      <MonthSelector selectedDate={selectedDate} onChange={setSelectedDate} />

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
            onClick={() => setIsClientModalOpen(true)}
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

      {/* Modals */}
      <Modal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        title="Register New Day"
      >
        <ServiceForm
          clients={clients}
          onSave={async (s) => { await addService(s); }}
          onClose={() => setIsServiceModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title="Add New Client"
      >
        <ClientForm
          onSave={async (n, c) => { await addClient(n, c); }}
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
