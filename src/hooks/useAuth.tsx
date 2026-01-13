import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchProfile = async (userId: string) => {
            try {
                const { data } = await supabase
                    .from('domestik_profiles')
                    .select('is_admin')
                    .eq('id', userId)
                    .single();

                setIsAdmin(data?.is_admin || false);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                fetchProfile(currentUser.id);
            } else {
                setIsAdmin(false);
                setLoading(false);
            }
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                fetchProfile(currentUser.id);
            } else {
                setIsAdmin(false);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        user,
        loading,
        isAdmin,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
