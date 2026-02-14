import type { Client, Service } from '../types';

// Demo clients
export const demoClients: Client[] = [
  { id: 'demo-1', name: 'Maria Silva', color: '#FF6B6B', archived: false, created_at: new Date().toISOString() },
  { id: 'demo-2', name: 'João Pereira', color: '#4ECDC4', archived: false, created_at: new Date().toISOString() },
  { id: 'demo-3', name: 'Ana Costa', color: '#45B7D1', archived: false, created_at: new Date().toISOString() },
  { id: 'demo-4', name: 'Carlos Santos', color: '#96CEB4', archived: false, created_at: new Date().toISOString() },
  { id: 'demo-5', name: 'Fernanda Lima', color: '#FECA57', archived: false, created_at: new Date().toISOString() },
];

// Generate demo services for the current year
export function generateDemoServices(): Service[] {
  const services: Service[] = [];
  const currentYear = new Date().getFullYear();
  const hourlyRates = [20, 22, 25, 18, 23];
  
  // Generate services for each client
  demoClients.forEach((client, clientIndex) => {
    // Generate 3-8 services per month for the last 6 months
    for (let month = 0; month < 6; month++) {
      const servicesCount = 3 + Math.floor(Math.random() * 6);
      
      for (let i = 0; i < servicesCount; i++) {
        const day = 1 + Math.floor(Math.random() * 28);
        const hours = 2 + Math.floor(Math.random() * 6);
        const rate = hourlyRates[clientIndex % hourlyRates.length];
        
        services.push({
          id: `demo-service-${client.id}-${month}-${i}`,
          date: `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          client_id: client.id,
          time_worked: hours,
          hourly_rate: rate,
          total: hours * rate,
          created_at: new Date().toISOString(),
          client: client,
        });
      }
    }
  });
  
  // Sort by date descending
  return services.sort((a, b) => b.date.localeCompare(a.date));
}

export const demoServices = generateDemoServices();
