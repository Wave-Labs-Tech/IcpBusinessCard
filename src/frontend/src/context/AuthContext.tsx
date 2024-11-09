// AuthContext.tsx

import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent, Identity, AnonymousIdentity, ActorSubclass } from "@dfinity/agent";
import { createActor } from "../declarations/backend";
import { _SERVICE } from "../declarations/backend/backend.did";
import ModalProviderSelect from '../components/auth/ModalProviderSelect';

const canisterId = process.env.REACT_APP_DFX_NETWORK === 'ic'
    ? 'jkmf4-caaaa-aaaal-amq3q-cai'
    : process.env.REACT_APP_CANISTER_ID_BACKEND as string;

const host = process.env.REACT_APP_DFX_NETWORK === "local" ? "http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai" : "https://identity.ic0.app";

interface AuthContextProps {
    isAuthenticated: boolean;
    identity: Identity;
    backend: ActorSubclass<_SERVICE>;
    login: () => void;
    logout: () => Promise<void>;
}

const defaultAuthContext: AuthContextProps = {
    isAuthenticated: false,
    identity: new AnonymousIdentity(),
    backend: createActor(canisterId, {
        agentOptions: { identity: new AnonymousIdentity(), host }
    }),
    login: () => {},
    logout: async () => {},
};

export const AuthContext = createContext<AuthContextProps>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [identity, setIdentity] = useState<Identity>(new AnonymousIdentity());
    const [backend, setBackend] = useState<ActorSubclass<_SERVICE>>(
        createActor(canisterId, {
            agentOptions: { identity: new AnonymousIdentity(), host }
        })
    );
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        const setupAgent = async () => {
            const agent = await HttpAgent.create({
                identity,
                host,
            });
            setBackend(createActor(canisterId, { agent }));
        };
        setupAgent();
    }, [identity]);

    async function init() {
        const authClient = await AuthClient.create();
        const identity = authClient.getIdentity();
        setIdentity(identity);

        if (!identity.getPrincipal().isAnonymous()) {
            setIsAuthenticated(true);
        }
    }

    // Abre el modal para elegir el proveedor
    const handleLoginClick = () => {
        setIsModalOpen(true);
    };

    // Función de login que toma la URL del proveedor
    const login = async (providerUrl: string) => {
        const authClient = await AuthClient.create();
        await authClient.login({
            identityProvider: providerUrl,
            onSuccess: () => {
                const identity = authClient.getIdentity();
                setIdentity(identity);
                setIsAuthenticated(true);
            },
            onError: (err) => console.error("Error al iniciar sesión:", err),
        });
    };

    const handleProviderSelection = async (providerUrl: string) => {
        setIsModalOpen(false); // Cierra el modal
        await login(providerUrl); // Llama a `login` con el proveedor seleccionado
    };

    const logout = async () => {
        const authClient = await AuthClient.create();
        await authClient.logout();
        setIdentity(new AnonymousIdentity());
        setIsAuthenticated(false);
        setBackend(
            createActor(canisterId, {
                agentOptions: { identity: new AnonymousIdentity(), host }
            })
        );
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, identity, backend, login: handleLoginClick, logout }}>
            {children}
            <ModalProviderSelect 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSelectProvider={handleProviderSelection} 
            />
        </AuthContext.Provider>
    );
}
