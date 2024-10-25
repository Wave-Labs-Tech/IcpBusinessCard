import React from 'react';
import './App.css';
import LoginButton from './components/auth/LoginButton';
import LogoutButton from './components/auth/LogoutButton';
import { useContext } from 'react';
import { UserProfile } from './components/userProfile/UserProfile';
import { AuthContext } from './context/AuthContext';
import { createActor } from './declarations/backend';
import { Principal } from "@dfinity/principal";

function App() {
  const { isAuthenticated, identity } = useContext(AuthContext);

  let canisterId: string | undefined = process.env.REACT_APP_CANISTER_ID_BACKEND;

  if (!canisterId) {
    throw new Error("El canister ID no está definido.");
  }

  let backend = createActor(Principal.fromText(canisterId), {
    agentOptions: {
      identity: identity,
      host: "http://localhost:4943",
    },
  });

  if (isAuthenticated) {
    console.log( backend.getPaginatePublicCards(BigInt(0)));
    console.log( backend.whoAmI());
  }

  return (
    <div className="App">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 text-center">
      <h1 className="text-3xl font-bold">Hello, Tailwind CSS!</h1>
      <p className="mt-4">Tu proyecto React ya tiene Tailwind configurado.</p>
    </div>
      <header className="App-header">
        <div className="header-title">ICP Business Card</div>
        {isAuthenticated ? <LogoutButton /> : <LoginButton />}
      </header>

      {/* User Profile and additional information */}
      {isAuthenticated ? (
        <div>
          <UserProfile />
          <div>User Principal ID: </div>
          <div style={{ fontSize: '0.8rem' }}>{identity.getPrincipal().toString()}</div>
        </div>
      ) : null}
      <div className="additional-info">Frontend en desarrollo</div>

      {/* Link */}
      <a
        className="link"
        href="https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=jkmf4-caaaa-aaaal-amq3q-cai"
        target="_blank" // Abre el enlace en una nueva pestaña
        rel="noopener noreferrer" // Mejora la seguridad al abrir el enlace
      >
        Interfase candid del Backend
      </a>

      {/* Footer */}
      <footer className="App-footer">
        <div className="footer-title">Wave Lab Tech</div>
        <ul className="footer-links">
          <li><a href="#">Link 1</a></li>
          <li><a href="#">Link 2</a></li>
          <li><a href="#">Link 3</a></li>
        </ul>
      </footer>
    </div>
  );
}

export default App;
