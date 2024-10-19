import React, { useState, useEffect } from 'react';
// import { Actor, HttpAgent } from '@dfinity/agent';

import { createClient } from "@connect2ic/core"
import { InternetIdentity, NFID } from "@connect2ic/core/providers"
import { Connect2ICProvider, useCanister, useConnect } from "@connect2ic/react"
// import { idlFactory as backend_idl, canisterId as backend } from './declarations/backend'; // Importa las declaraciones

import * as backend from "./declarations/backend"
import logo from './logo.svg';
import './App.css';


declare let process : {
  env: {
    DFX_NETWORK: string
    NODE_ENV: string
  }
}
const network = process.env.DFX_NETWORK || (process.env.NODE_ENV === "production" ? "ic" : "local");
const internetIdentityUrl = network === "local" ? "http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai" : "https://identity.ic0.app"

const client = createClient({
  canisters: {
    backend,
  },
  providers: [
    new InternetIdentity({
      dev: true,
      providerUrl:
      internetIdentityUrl,
    }),
    new NFID(),
  ],
  globalProviderConfig: {
    // dev: import.meta.env.DEV,
    dev: true,
  },
})

function App() {
  const { isConnected, principal} = useConnect();
  const [backend] = useCanister("backend");

  useEffect(() => {
    // Llama a una función del backend (por ejemplo `whoAmI`)
    backend.whoAmI().then((returnedPrincipal: unknown) => {
      console.log(returnedPrincipal);
    }).catch((error) => {
      console.error("Error calling whoAmI:", error);  // Manejo de errores
    });
  }, []);


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default () => (
  <Connect2ICProvider client={client}>
    <App />
  </Connect2ICProvider>
)
