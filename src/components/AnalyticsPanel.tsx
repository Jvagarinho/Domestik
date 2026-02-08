// React is not directly used in this file
import { DashboardAdvanced } from './DashboardAdvanced'
import type { Service } from '../types'

export function AnalyticsPanel({ services }: { services: Service[] }) {
  return (
    <div className="analytics-panel" style={{ marginTop: 16, maxWidth: 1100, marginLeft: 'auto', marginRight: 'auto', padding: '0 12px', overflowX: 'hidden' }}>
      <DashboardAdvanced services={services} />
    </div>
  )
}
