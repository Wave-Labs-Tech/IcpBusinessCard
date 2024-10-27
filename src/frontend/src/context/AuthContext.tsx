import React, { createContext, ReactNode, useCallback, useEffect, useState } from 'react';
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
        REACT_APP_CANISTER_ID: string;
    }
};

const network = process.env.REACT_APP_DFX_NETWORK || 'local';

const internetIdentityUrl =
    network === "local"
        ? "http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai"
        : "https://identity.ic0.app";

export const AuthContext = createContext<AuthContextProps>(defaultAuthContext);

// console.log("Network:", process.env.REACT_APP_DFX_NETWORK);
// console.log("Canister_ID:", process.env.REACT_APP_CANISTER_ID);
// console.log("InternetIdentity URL: ", internetIdentityUrl);
console.log("createdActor AuthContext: ", createdActor);
console.log("idlFactory: ",idlFactory);
console.log("canisterId: ", canisterId);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [identity, setIdentity] = useState<Identity>(new AnonymousIdentity());
    const [backendActor, setBackendActor] = useState<ActorSubclass<_SERVICE> | null>(null);  // Estado para almacenar el actor

    useEffect(() => {
        init();
    }, []);

    const init = useCallback(async () => {
        const authClient = await AuthClient.create();
        const identity = authClient.getIdentity();

        setIdentity(identity);

        const principal = identity.getPrincipal();

        if (!principal.isAnonymous()) {
            setIsAuthenticated(true);
        }

        // Crea el actor del backend utilizando la identidad
        // const actor = await createActorWithIdentity(identity);
        const actor = await createActorWithIdentity(identity);
        if (actor) setBackendActor(actor);
    }, []);


    const createActorWithIdentity = async (identity: Identity) => {

        const agent = await HttpAgent.create({
            identity,
            // Añadir cualquier otro parámetro necesario, como host o fetch
        });

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
        try {
            const authClient = await AuthClient.create();

            // Intenta iniciar sesión
            await authClient.login({
                identityProvider: internetIdentityUrl,
                onSuccess: async () => {
                    const identity = authClient.getIdentity();
                    setIdentity(identity);

                    // Actualiza el estado de autenticación
                    setIsAuthenticated(true);

                    // Crea el actor con la nueva identidad
                    const actor = await createActorWithIdentity(identity);
                    if (actor) setBackendActor(actor);
                },
                onError: (err) => console.error('Error al iniciar sesión:', err),
            });
        } catch (error) {
            console.error('Error durante el inicio de sesión:', error);
        }
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
