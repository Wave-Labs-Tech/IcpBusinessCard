import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { AnonymousIdentity, Identity } from "@dfinity/agent";

interface AuthContextProps {
    isAuthenticated: boolean;
    identity: Identity;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

const defaultAuthContext: AuthContextProps = {
    isAuthenticated: false,
    identity: new AnonymousIdentity(),
    login: async () => { },
    logout: async () => { }
};

export const AuthContext = createContext<AuthContextProps>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [identity, setIdentity] = useState(new AnonymousIdentity());

    useEffect(() => {
        init();
    }, []);

    async function init() {
        const authClient = await AuthClient.create();
        const identity = authClient.getIdentity();

        setIdentity(identity);

        const principal = identity.getPrincipal();

        if (!principal.isAnonymous()) {
            setIsAuthenticated(true);
        }
    }

    const login = async () => {
        const authClient = await AuthClient.create();
        authClient.login({
            identityProvider: process.env.REACT_APP_INTERNET_COMPUTER_PROVIDER,
            onSuccess: () => {
                setIdentity(authClient.getIdentity());
                setIsAuthenticated(true);
            },
            onError: (err) => console.error(err),
        });
    };

    const logout = async () => {
        const authClient = await AuthClient.create();
        await authClient.logout();
        setIdentity(new AnonymousIdentity());
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value= {{ isAuthenticated, identity, login, logout }}>
            { children }
        </AuthContext.Provider>
    );
}