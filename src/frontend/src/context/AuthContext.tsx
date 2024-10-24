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

declare let process: {
    env: {
        REACT_APP_DFX_NETWORK: string
    }
}

const network = process.env.REACT_APP_DFX_NETWORK || 'local';

const internetIdentityUrl =
    network === "local"
        ? "http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai"
        : "https://identity.ic0.app"

export const AuthContext = createContext<AuthContextProps>(defaultAuthContext);

console.log("Network:", process.env.REACT_APP_DFX_NETWORK);
console.log("InternetIdentity URL: ", internetIdentityUrl)

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
            identityProvider: internetIdentityUrl,
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
        <AuthContext.Provider value={{ isAuthenticated, identity, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}