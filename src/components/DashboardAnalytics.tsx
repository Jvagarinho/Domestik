// React is not directly used here
import { DashboardAdvanced } from './DashboardAdvanced';
import type { Service, Client } from '../types';

interface DashboardAnalyticsProps {
  services: Service[];
  clients: Client[];
}

export function DashboardAnalytics({ services }: DashboardAnalyticsProps) {
  // We reuse the advanced dashboard logic but keep the data flow minimal here
  // The actual rendering of charts relies on DashboardAdvanced, which aggregates from services
  return (
    <div className="card" style={{ padding: '16px' }}>
      <h2 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Analytics</h2>
      <DashboardAdvanced services={services} />
      {/* Clients data are passed via props if needed for additional charts in the future */}
    </div>
  );
}
