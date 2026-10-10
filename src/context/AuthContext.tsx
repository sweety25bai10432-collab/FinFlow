import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types.js';
import { authApi, getStoredToken } from '../services/api.js';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    signup: (name: string, email: string, pass: string, budget?: number, currency?: string) => Promise<void>;
    demoLogin: () => Promise<void>;
    logout: () => void;
    updateBudget: (budget: number, currency?: string) => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const refreshProfile = async () => {
        const token = getStoredToken();
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await authApi.getMe();
            setUser(res.user);
        } catch (err) {
            console.warn('Session expired or invalid, logging out', err);
            authApi.logout();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshProfile();
    }, []);

    const login = async (email: string, pass: string) => {
        const res = await authApi.login({ email, password: pass });
        setUser(res.user);
    };

    const signup = async (
        name: string,
        email: string,
        pass: string,
        budget?: number,
        currency?: string
    ) => {
        const res = await authApi.register({
            name,
            email,
            password: pass,
            monthlyBudget: budget,
            currency,
        });
        setUser(res.user);
    };

    const demoLogin = async () => {
        const res = await authApi.demoLogin();
        setUser(res.user);
    };

    const logout = () => {
        authApi.logout();
        setUser(null);
    };

    const updateBudget = async (budget: number, currency?: string) => {
        const res = await authApi.updateBudget({ monthlyBudget: budget, currency });
        setUser(res.user);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                signup,
                demoLogin,
                logout,
                updateBudget,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
