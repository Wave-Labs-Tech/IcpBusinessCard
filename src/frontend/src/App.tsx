import React, { useState, useContext, useEffect } from 'react';
import './App.css';
import LoginButton from './components/auth/LoginButton';
import LogoutButton from './components/auth/LogoutButton';
import { UserProfile } from './components/userProfile/UserProfile';
import { AuthContext } from './context/AuthContext';
import { createActor } from './declarations/backend';
import { Principal } from "@dfinity/principal";
import { Routes, Route } from 'react-router-dom';
import CreateCard from './components/cardForm/CreateCard';
import Navbar from './components/navbar/NavBar';
import Dashboard from './components/dashboard/Dashboard';



function App() {
  const { isAuthenticated, identity } = useContext(AuthContext);
  const [whoAmI, setWhoAmI] = useState("");
  const [page, setPage] = useState(0);

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
    console.log(backend.getPaginatePublicCards(BigInt(0)));
    console.log(backend.whoAmI());
  }

  //////////////////////// Esta funcion y su respectiva llamada andan bien /////
  const getPaginatePublicCards = async (index: number) => {
    console.log("getPaginatePublicCards")
    let response = await backend.getPaginatePublicCards(BigInt(index));

    if ("Ok" in response) {

      response.Ok.cardsPreview.map(card => {
        console.log("Nombre del usuario:", card.name);
      });


      // Guardar thereIsMore en una variable
      const hayMas = response.Ok.thereIsMore;
      console.log("¿Hay más elementos?", hayMas);
    } else {
      // Si la respuesta tiene un error, maneja el caso
      console.error("Error:", response.Err);
    }

  };

  useEffect(() => {
    getPaginatePublicCards(0); // Asegúrate de que no se ejecute varias veces sin control
  }, []);


  /////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    const fetchWhoAmI = async () => {
      if (isAuthenticated) {
        try {
          const whoAmIResponse = await backend.whoAmI();
          if (whoAmIResponse) setWhoAmI(whoAmIResponse);
          console.log("whoAmIResponse",whoAmIResponse);
        } catch (error) {
          console.error("Error al llamar a whoAmI:", error);
        }
      }
    };

    fetchWhoAmI();
  }, [isAuthenticated, backend]);

  return (
    <div className="App">
      <div className="container">
        <Routes>
          {/* <Route path="/" element={<ProductsGrid onAddToCart={handleAddToCart} />} /> */}
          {/* <Route path="*" element={<ErrorPage />} /> */}
          <Route path="*" element={<h2>La ruta seguida es erronea</h2>} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/createcard" element={<CreateCard />} />
          {/* <Route path="/dashboard" element={<Dashboard/>} /> */}
          <Route path="/userProfile" element={<UserProfile />} />
        </Routes>
      </div>
      {/* Header */}
      {/* <div className="border-2 border-blue-500 text-red-700 p-4 text-center"> */}
      {/* <h1 className="text-3xl font-bold">Hello, Tailwind CSS!</h1>
      <p className="mt-4">Tu proyecto React ya tiene Tailwind configurado.</p> */}
      {/* </div> */}
      {/*<header className="App-header">*/}
      {/* <div className="header-title">ICP Business Card</div> */}
      {/* {isAuthenticated ? <LogoutButton /> : <LoginButton />} */}
      {/*</header>*/}

      {/* User Profile and additional information */}
      {isAuthenticated ? (
        <div>
          <UserProfile />
          <div>User Principal ID: </div>
          <div style={{ fontSize: '0.8rem' }}>{identity.getPrincipal().toString()}</div>
        </div>
      ) : null}
      <div className="text-stone-800 bg-stone-200 m-auto mt-12 mb-36 py-4 px-20 w-fit border-2 border-stone-700 rounded-md shadow-2xl">
        <p>Frontend en desarrollo</p>

      {/* Link */}
      <a
        // className="link"
        className="text-blue-600 bg-stone-300 m-auto p-1 rounded-md shadow-2xl"
        href="https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=jkmf4-caaaa-aaaal-amq3q-cai"
        target="_blank" // Abre el enlace en una nueva pestaña
        rel="noopener noreferrer" // Mejora la seguridad al abrir el enlace
      >
        Interface candid del Backend
      </a>
      </div>
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
