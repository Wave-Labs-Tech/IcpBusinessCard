import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent, AnonymousIdentity, Identity, ActorSubclass } from "@dfinity/agent";
import { backend as createdActor, canisterId, idlFactory } from "../declarations/backend"; // Ajusta la ruta según sea necesario
import { _SERVICE } from "../declarations/backend/backend.did"; // Importa el tipo de servicio

interface AuthContextProps {
    isAuthenticated: boolean;
    identity: Identity;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    backendActor: ActorSubclass<_SERVICE> | null;  // Actor del backend
}

const defaultAuthContext: AuthContextProps = {
    isAuthenticated: false,
    identity: new AnonymousIdentity(),
    login: async () => { },
    logout: async () => { },
    backendActor: null  // El actor por defecto es null
};

declare let process: {
    env: {
        REACT_APP_DFX_NETWORK: string;
    }
};

const network = process.env.REACT_APP_DFX_NETWORK || 'local';

const internetIdentityUrl =
    network === "local"
        ? "http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai"
        : "https://identity.ic0.app";

export const AuthContext = createContext<AuthContextProps>(defaultAuthContext);

console.log("Network:", process.env.REACT_APP_DFX_NETWORK);
console.log("InternetIdentity URL: ", internetIdentityUrl);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [identity, setIdentity] = useState<Identity>(new AnonymousIdentity());
    const [backendActor, setBackendActor] = useState<ActorSubclass<_SERVICE> | null>(null);  // Estado para almacenar el actor

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

        // Crea el actor del backend utilizando la identidad
        const actor = createActorWithIdentity(identity);
        setBackendActor(actor);
    }

    const createActorWithIdentity = (identity: Identity) => {
        const agent = new HttpAgent({ identity });

        // Si es un entorno local, podría ser necesario llamar a fetchRootKey para evitar problemas de certificados
        if (network === "local") {
            agent.fetchRootKey();
        }

        // Crea y devuelve el actor usando el IDL y el canisterId
        return Actor.createActor<_SERVICE>(idlFactory, {
            agent,
            canisterId,
        });
    };

    const login = async () => {
        const authClient = await AuthClient.create();
        authClient.login({
            identityProvider: internetIdentityUrl,
            onSuccess: () => {
                const identity = authClient.getIdentity();
                setIdentity(identity);
                setIsAuthenticated(true);

                // Crea el actor con la nueva identidad
                const actor = createActorWithIdentity(identity);
                setBackendActor(actor);
            },
            onError: (err) => console.error(err),
        });
    };

    const logout = async () => {
        const authClient = await AuthClient.create();
        await authClient.logout();
        setIdentity(new AnonymousIdentity());
        setIsAuthenticated(false);

        // Reestablece el actor a null al cerrar sesión
        setBackendActor(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, identity, login, logout, backendActor }}>
            {children}
        </AuthContext.Provider>
    );
}
