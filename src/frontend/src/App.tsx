/* eslint-disable array-callback-return */
import React, { useState, useContext, useEffect } from 'react';
import './App.css';
import LoginButton from './components/auth/LoginButton';
import LogoutButton from './components/auth/LogoutButton';
import { UserProfile } from './components/userProfile/UserProfile';
import { AuthContext } from './context/AuthContext';
// import { createActor } from './declarations/backend';
// import { Principal } from "@dfinity/principal";



function App() {
  
  // const [page, setPage] = useState(0);
  const { isAuthenticated, backend, identity } = useContext(AuthContext)
  const [whoAmI, setWhoAmI] = useState(identity.getPrincipal().toText());
  let canisterId: string | undefined = process.env.REACT_APP_CANISTER_ID_BACKEND;

  if (!canisterId) {
    throw new Error("El canister ID no está definido.");
  }


  ////////////////////// Esta funcion y su respectiva llamada andan bien /////
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getPaginatePublicCards = async (index: number) => {
    setWhoAmI(await backend.whoAmI());    // BORRAR
    console.log("From App.tsx whoAmI: ", whoAmI);      // BORRAR
    if (backend) {
      let response = await backend.getPaginatePublicCards(BigInt(index));

      if ("Ok" in response) {
        console.log("From App.tsx() getPaginatePublicCards")
        response.Ok.cardsPreview.map(card => {
          console.log("Usuario:", card);
        });
        console.log("¿Hay más elementos?", response.Ok.thereIsMore);
      } else {

        console.log("Error al llamar a getPaginateCards")
        console.error("Error:", response.Err);
      }
    }
  };

  useEffect(() => {
    getPaginatePublicCards(0); 
  }, [getPaginatePublicCards, isAuthenticated]);

  /////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    const fetchWhoAmI = async () => {
      if (isAuthenticated && backend) {
        try {
          setWhoAmI(await backend.whoAmI());
          console.log("From App.tsx: WhoAmI", whoAmI);
        } catch (error) {
          console.error("Error al llamar a whoAmI:", error);
        }
      }
    };

    fetchWhoAmI();
  }, [isAuthenticated, backend, whoAmI]);

  return (
    <div className="App">
      {/* Header */}
      {/* <div className="bg-blue-500 text-black p-4 text-center">
        <h1 className="text-3xl font-bold">Hello, Tailwind CSS!</h1>
        <p className="mt-4">Tu proyecto React ya tiene Tailwind configurado.</p>
      </div> */}
      <header className="App-header">
        <div className="header-title">ICP Business Card</div>
        {isAuthenticated ? <LogoutButton /> : <LoginButton />}
      </header>
      <div style={{ fontSize: '0.8rem' }}>{whoAmI}</div>

      {/* User Profile and additional information */}
      {isAuthenticated ? (
        <div>
          <UserProfile />
          <div>User Principal ID: </div>
          {/* <div style={{ fontSize: '0.8rem' }}>{identity.getPrincipal().toString()}</div> */}
          <div style={{ fontSize: '0.8rem' }}>{whoAmI}</div>
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
