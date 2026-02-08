// React not directly used
import { DashboardAdvanced } from '../components/DashboardAdvanced';
import type { Service } from '../types';

export function AnalyticsPage({ services }: { services: Service[] }) {
  // Analytics page renders advanced dashboard charts
  return (
    <div className="container animate-fade-in" style={{ padding: '0 0 40px' }}>
      <h2 style={{ fontSize: '1.25rem', margin: '0 0 12px' }}>Analytics</h2>
      <DashboardAdvanced services={services} />
    </div>
  );
}
