export interface Client {
    id: string;
    name: string;
    color: string;
    created_at?: string;
    archived?: boolean;
}

export interface Service {
    id: string;
    date: string;
    client_id: string;
    time_worked: number;
    hourly_rate: number;
    total: number;
    created_at?: string;
    client?: Client;
}

export interface DashboardStats {
    monthlyEarnings: number;
    totalHours: number;
    serviceCount: number;
}
