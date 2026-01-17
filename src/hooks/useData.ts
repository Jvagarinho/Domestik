import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Client, Service } from '../types';

export function useClients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchClients = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('domestik_clients')
            .select('*')
            .order('name');

        if (data) setClients((data as Client[]).filter(c => !c.archived));
        setLoading(false);
    };

    const addClient = async (name: string, color: string) => {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('domestik_clients')
            .insert([{
                name,
                color,
                user_id: user?.id
            }])
            .select();

        if (data) setClients([...clients, data[0]].sort((a, b) => a.name.localeCompare(b.name)));
        return { data, error };
    };

    const updateClient = async (id: string, updates: Partial<Client>) => {
        const { data, error } = await supabase
            .from('domestik_clients')
            .update(updates)
            .eq('id', id)
            .select('*');

        if (data) {
            setClients(clients.map(c => c.id === id ? data[0] as Client : c).sort((a, b) => a.name.localeCompare(b.name)));
        }
        return { data, error };
    };

    const archiveClient = async (id: string) => {
        const { data, error } = await supabase
            .from('domestik_clients')
            .update({ archived: true })
            .eq('id', id)
            .select('*');

        if (!error) {
            setClients(clients.filter(c => c.id !== id));
        }
        return { data, error };
    };

    useEffect(() => {
        fetchClients();
    }, []);

    return { clients, loading, fetchClients, addClient, updateClient, archiveClient };
}

export function useServices() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchServices = async (clientId?: string, startDate?: string, endDate?: string) => {
        setLoading(true);
        let query = supabase
            .from('domestik_services')
            .select('*, client:domestik_clients(*)')
            .order('date', { ascending: false });

        if (clientId) query = query.eq('client_id', clientId);
        if (startDate) query = query.gte('date', startDate);
        if (endDate) query = query.lte('date', endDate);

        const { data } = await query;

        if (data) setServices(data as Service[]);
        setLoading(false);
    };

    const addService = async (service: Omit<Service, 'id' | 'created_at'>) => {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('domestik_services')
            .insert([{
                ...service,
                user_id: user?.id
            }])
            .select('*, client:domestik_clients(*)');

        if (data) setServices([data[0] as Service, ...services]);
        return { data, error };
    };

    const updateService = async (id: string, updates: Partial<Service>) => {
        const { data, error } = await supabase
            .from('domestik_services')
            .update(updates)
            .eq('id', id)
            .select('*, client:domestik_clients(*)');

        if (data) {
            setServices(services.map(s => s.id === id ? data[0] as Service : s));
        }
        return { data, error };
    };

    useEffect(() => {
        fetchServices();
    }, []);

    return { services, loading, fetchServices, addService, updateService };
}
