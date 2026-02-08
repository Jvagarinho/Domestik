import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Client, Service } from '../types';
import { useAuth } from './useAuth';
import { validateClient, validateService } from '../lib/validation';
import { useToast } from './useToast';

export interface UseClientsReturn {
    clients: Client[];
    loading: boolean;
    error: string | null;
    fetchClients: () => Promise<void>;
    addClient: (name: string, color: string) => Promise<{ success: boolean; error?: string }>;
    updateClient: (id: string, updates: Partial<Client>) => Promise<{ success: boolean; error?: string }>;
    archiveClient: (id: string) => Promise<{ success: boolean; error?: string }>;
    isOwner: (clientId: string) => boolean;
}

export function useClients(): UseClientsReturn {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { error: showError } = useToast();

    // Verificar se o cliente pertence ao utilizador atual
    const isOwner = (clientId: string): boolean => {
        return clients.some(c => c.id === clientId);
    };

    const fetchClients = async () => {
        if (!user) {
            setClients([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Filtro explícito por user_id para garantir isolamento
            const { data, error: fetchError } = await supabase
                .from('domestik_clients')
                .select('*')
                .eq('user_id', user.id)
                .eq('archived', false)
                .order('name');

            if (fetchError) {
                console.error('Error fetching clients:', fetchError);
                throw new Error('Failed to fetch clients');
            }
            
            if (data) setClients(data as Client[]);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to fetch clients';
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const addClient = async (name: string, color: string): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Validate input
        const validation = validateClient({ name, color });
        if (!validation.success) {
            return { success: false, error: validation.errors.join(', ') };
        }

        try {
            const { data, error: insertError } = await supabase
                .from('domestik_clients')
                .insert([{
                    name: validation.data.name,
                    color: validation.data.color,
                    user_id: user.id
                }])
                .select();

            if (insertError) {
                console.error('Error adding client:', insertError);
                throw new Error('Failed to add client');
            }
            
            if (data) {
                setClients(prev => [...prev, data[0] as Client].sort((a, b) => a.name.localeCompare(b.name)));
            }
            return { success: true };
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to add client';
            return { success: false, error: errorMsg };
        }
    };

    const updateClient = async (id: string, updates: Partial<Client>): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Verificar se o cliente pertence ao utilizador
        if (!isOwner(id)) {
            console.error('Security: Attempted to update client not owned by user');
            return { success: false, error: 'Client not found or access denied' };
        }

        // Validate if name or color is being updated
        if (updates.name !== undefined || updates.color !== undefined) {
            const clientToValidate = {
                name: updates.name ?? clients.find(c => c.id === id)?.name ?? '',
                color: updates.color ?? clients.find(c => c.id === id)?.color ?? '#10B981'
            };
            const validation = validateClient(clientToValidate);
            if (!validation.success) {
                return { success: false, error: validation.errors.join(', ') };
            }
        }

        try {
            const { data, error: updateError } = await supabase
                .from('domestik_clients')
                .update(updates)
                .eq('id', id)
                .eq('user_id', user.id) // Garantir que só atualiza se for o dono
                .select('*');

            if (updateError) {
                console.error('Error updating client:', updateError);
                throw new Error('Failed to update client');
            }

            if (data && data.length > 0) {
                setClients(prev => prev.map(c => c.id === id ? data[0] as Client : c).sort((a, b) => a.name.localeCompare(b.name)));
                return { success: true };
            } else {
                return { success: false, error: 'Client not found or access denied' };
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to update client';
            return { success: false, error: errorMsg };
        }
    };

    const archiveClient = async (id: string): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Verificar se o cliente pertence ao utilizador
        if (!isOwner(id)) {
            console.error('Security: Attempted to archive client not owned by user');
            return { success: false, error: 'Client not found or access denied' };
        }

        try {
            const { error: archiveError } = await supabase
                .from('domestik_clients')
                .update({ archived: true })
                .eq('id', id)
                .eq('user_id', user.id); // Garantir que só arquiva se for o dono

            if (archiveError) {
                console.error('Error archiving client:', archiveError);
                throw new Error('Failed to archive client');
            }
            
            setClients(prev => prev.filter(c => c.id !== id));
            return { success: true };
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to archive client';
            return { success: false, error: errorMsg };
        }
    };

    useEffect(() => {
        if (user) {
            fetchClients();
        } else {
            setClients([]);
            setLoading(false);
        }
    }, [user]);

    return { clients, loading, error, fetchClients, addClient, updateClient, archiveClient, isOwner };
}

export interface UseServicesReturn {
    services: Service[];
    loading: boolean;
    error: string | null;
    fetchServices: (clientId?: string, startDate?: string, endDate?: string) => Promise<void>;
    addService: (service: Omit<Service, 'id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
    updateService: (id: string, updates: Partial<Service>) => Promise<{ success: boolean; error?: string }>;
    deleteService: (id: string) => Promise<{ success: boolean; error?: string }>;
    isOwner: (serviceId: string) => boolean;
}

export function useServices(): UseServicesReturn {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { error: showError } = useToast();

    // Verificar se o serviço pertence ao utilizador atual
    const isOwner = (serviceId: string): boolean => {
        return services.some(s => s.id === serviceId);
    };

    const fetchServices = async (clientId?: string, startDate?: string, endDate?: string) => {
        if (!user) {
            setServices([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            let query = supabase
                .from('domestik_services')
                .select('*, client:domestik_clients(*)')
                .eq('user_id', user.id) // Filtro explícito por user_id
                .order('date', { ascending: false });

            if (clientId) query = query.eq('client_id', clientId);
            if (startDate) query = query.gte('date', startDate);
            if (endDate) query = query.lte('date', endDate);

            const { data, error: fetchError } = await query;

            if (fetchError) {
                console.error('Error fetching services:', fetchError);
                throw new Error('Failed to fetch services');
            }
            
            if (data) setServices(data as Service[]);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to fetch services';
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const addService = async (service: Omit<Service, 'id' | 'created_at'>): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Validate input
        const validation = validateService(service);
        if (!validation.success) {
            return { success: false, error: validation.errors.join(', ') };
        }

        try {
            const { error: insertError } = await supabase
                .from('domestik_services')
                .insert([{
                    ...validation.data,
                    user_id: user.id
                }]);

            if (insertError) {
                console.error('Error adding service:', insertError);
                throw new Error('Failed to add service');
            }
            
            // Não atualizamos o estado localmente aqui
            // O componente pai deve fazer refetch para aplicar os filtros corretamente
            return { success: true };
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to add service';
            return { success: false, error: errorMsg };
        }
    };

    const updateService = async (id: string, updates: Partial<Service>): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Verificar se o serviço pertence ao utilizador
        if (!isOwner(id)) {
            console.error('Security: Attempted to update service not owned by user');
            return { success: false, error: 'Service not found or access denied' };
        }

        // Validate if we're updating service data
        if (updates.date || updates.client_id || updates.time_worked !== undefined || updates.hourly_rate !== undefined || updates.total !== undefined) {
            const serviceToValidate = {
                date: updates.date ?? services.find(s => s.id === id)?.date ?? new Date().toISOString().split('T')[0],
                client_id: updates.client_id ?? services.find(s => s.id === id)?.client_id ?? '',
                time_worked: updates.time_worked ?? services.find(s => s.id === id)?.time_worked ?? 0,
                hourly_rate: updates.hourly_rate ?? services.find(s => s.id === id)?.hourly_rate ?? 0,
                total: updates.total ?? services.find(s => s.id === id)?.total ?? 0
            };
            const validation = validateService(serviceToValidate);
            if (!validation.success) {
                return { success: false, error: validation.errors.join(', ') };
            }
        }

        try {
            const { error: updateError } = await supabase
                .from('domestik_services')
                .update(updates)
                .eq('id', id)
                .eq('user_id', user.id); // Garantir que só atualiza se for o dono

            if (updateError) {
                console.error('Error updating service:', updateError);
                throw new Error('Failed to update service');
            }

            // Não atualizamos o estado localmente aqui
            // O componente pai deve fazer refetch para aplicar os filtros corretamente
            return { success: true };
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to update service';
            return { success: false, error: errorMsg };
        }
    };

    const deleteService = async (id: string): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Verificar se o serviço pertence ao utilizador
        if (!isOwner(id)) {
            console.error('Security: Attempted to delete service not owned by user');
            return { success: false, error: 'Service not found or access denied' };
        }

        try {
            const { error: deleteError } = await supabase
                .from('domestik_services')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id); // Garantir que só elimina se for o dono

            if (deleteError) {
                console.error('Error deleting service:', deleteError);
                throw new Error('Failed to delete service');
            }
            
            // Não atualizamos o estado localmente aqui
            // O componente pai deve fazer refetch para aplicar os filtros corretamente
            return { success: true };
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to delete service';
            return { success: false, error: errorMsg };
        }
    };

    useEffect(() => {
        if (user) {
            fetchServices();
        } else {
            setServices([]);
            setLoading(false);
        }
    }, [user]);

    return { services, loading, error, fetchServices, addService, updateService, deleteService, isOwner };
}
