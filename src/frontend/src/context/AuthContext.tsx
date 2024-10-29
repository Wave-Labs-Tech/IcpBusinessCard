import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent, Identity, AnonymousIdentity, ActorSubclass } from "@dfinity/agent";
import { createActor, /* canisterId */ } from "../declarations/backend";
import { _SERVICE } from "../declarations/backend/backend.did";

const canisterId = process.env.REACT_APP_DFX_NETWORK === 'ic'
    ? 'jkmf4-caaaa-aaaal-amq3q-cai' // ID de mainnet desde canisters_ids.json
    : process.env.REACT_APP_CANISTER_ID_BACKEND as string;


const internetIdentityUrl =
    process.env.REACT_APP_DFX_NETWORK === "local"
        ? "http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai"
        : "https://identity.ic0.app";

const host = 
    process.env.REACT_APP_DFX_NETWORK === "local"
    ? "http://localhost:4943"
    : "https://ic0.app"



interface AuthContextProps {
    isAuthenticated: boolean;
    identity: Identity;
    backend: ActorSubclass<_SERVICE>; // Asegura que `backend` nunca sea null
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

const defaultAuthContext: AuthContextProps = {
    isAuthenticated: false,
    identity: new AnonymousIdentity(),
    backend: createActor(canisterId, {
        agentOptions: { identity: new AnonymousIdentity(), host }
    }),
    login: async () => { },
    logout: async () => { },
};



export const AuthContext = createContext<AuthContextProps>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [identity, setIdentity] = useState<Identity>(new AnonymousIdentity());
    const [backend, setBackend] = useState<ActorSubclass<_SERVICE>>(
        // Inicializa `backend` con una `AnonymousIdentity`
        createActor(canisterId!, {
            agentOptions: { identity: new AnonymousIdentity(), host }
        })
    );

    useEffect(() => {
        init();
    }, []);

    // Actualiza `backend` cuando cambia `identity`
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

        // Si el usuario ya está autenticado, actualiza el estado
        if (!identity.getPrincipal().isAnonymous()) {
            setIsAuthenticated(true);
        }
    }

    const login = async () => {
        const authClient = await AuthClient.create();
        await authClient.login({
            identityProvider: internetIdentityUrl,
            onSuccess: () => {
                const identity = authClient.getIdentity();
                setIdentity(identity);
                setIsAuthenticated(true);
            },
            onError: (err) => console.error("Error al iniciar sesión:", err),
        });
    };

    const logout = async () => {
        const authClient = await AuthClient.create();
        await authClient.logout();
        setIdentity(new AnonymousIdentity());
        setIsAuthenticated(false);
        // Reinicia `backend` para usuarios no autenticados
        setBackend(
            createActor(canisterId, {
                agentOptions: { identity: new AnonymousIdentity(), host }
            })
        );
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, identity, backend, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
