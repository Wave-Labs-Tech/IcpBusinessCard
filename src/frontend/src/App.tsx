/* eslint-disable array-callback-return */
import React, { useState, useContext, useEffect, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import { UserProfile } from './components/userProfile/UserProfile';
import { AuthContext } from './context/AuthContext';
import CardCarousel from './components/CardCarousel';

function App() {
  const { isAuthenticated, backend, identity, cardDataUser } = useContext(AuthContext);
  const [whoAmI, setWhoAmI] = useState(identity.getPrincipal().toText());
  const [cards, setCards] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);  // Estado para controlar si hay más tarjetas para cargar
  const [initialLoad, setInitialLoad] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CompleteCardData | null>(null);

  let canisterId: string | undefined = process.env.REACT_APP_CANISTER_ID_BACKEND;

  if (!canisterId) {
    throw new Error("El canister ID no está definido.");
  }

  // Llama a getPaginatePublicCards y actualiza las tarjetas y el indicador de "hasMore"
  const getPaginatePublicCards = useCallback(async (index: number) => {
    if (backend) {
      const response = await backend.getPaginatePublicCards(BigInt(index));
      if ("Ok" in response) {
        const newCards = response.Ok.cardsPreview;
        setCards((prev) => [...prev, ...newCards]); // Añade las nuevas tarjetas al estado
        setHasMore(response.Ok.hasMore);
      } else {
        console.error("Error:", response.Err);
      }
    }
  }, [backend]);

  const fetchCardDetails = async (owner: Principal) => {
    try {
      const response = await backend.getCardByPrincipal(owner);
      if ("Ok" in response) {
        setSelectedCard(response.Ok); // Guarda los datos completos de la tarjeta en el estado
      } else {
        console.error("Error al obtener los detalles de la tarjeta:", response.Err);
      }
    } catch (error) {
      console.error("Error al llamar a getCardByPrincipal:", error);
    }
  };

  const handleCardClick = (owner: Principal) => {
    fetchCardDetails(owner);
  };

  const handleBackToCarousel = () => {
    setSelectedCard(null);
  };

  useEffect(() => {
    if (!initialLoad) {
      getPaginatePublicCards(0);
      setInitialLoad(true); // Solo cargará al montar el componente
    }
  }, [getPaginatePublicCards, initialLoad]);

  useEffect(() => {
    const fetchWhoAmI = async () => {
      if (isAuthenticated && backend) {
        try {
          setWhoAmI(await backend.whoAmI());
        } catch (error) {
          console.error("Error al llamar a whoAmI:", error);
        }
      }
    };

    fetchWhoAmI();
  }, [isAuthenticated, backend, whoAmI]);
  
  return (
    <div className="App">
      
      {/*<header className="App-header">*/}
      <header className="App-header">
        <div className="header-title">ICP Business Card</div>
        {isAuthenticated ? <LogoutButton /> : <LoginButton />}
      </header>

     

      {/* <div className="additional-info">Tarjetas Públicas</div> */}
      <div className="bg-stone-100 text-green-600 font-bold text-xl m-auto mt-20 mb-4 py-2 px-20 rounded-md shadow-2xl">
        Tarjetas Públicas</div>

      {/* Carrusel de tarjetas */}
      
        
      <div className="flex justify-center mt-4">
        <CardCarousel 
          cards={cards}
          fetchCards={getPaginatePublicCards}
          hasMore={hasMore}
        />
      </div>
      {isAuthenticated ? (
        <div className="flex flex-col items-center place-content-center mt-24">
          {/* <p className="text-gray-400 text-green-200 text-3xl font-bold mb-8">This is your Smart Card</p> */}
          <p className="bg-stone-100 text-green-600 font-bold text-xl m-auto mt-20 mb-4 py-2 px-20 rounded-md shadow-2xl">Tu Smart Card</p>
          <UserProfile />
          <hr className="w-3/5 border-t-2 border-green-600 mt-12" />
            <p className="w-fit text-green-600 font-bold bg-stone-100 mt-8 mb-4 py-1 px-20 rounded-md shadow-2xl">
              User Principal ID: </p>
           
          <div className="w-fit text-green-600 font-bold bg-stone-100 mb-8 py-2 px-20 rounded-md shadow-2xl">{whoAmI}</div>
          <hr className="w-3/5 border-t-2 border-green-600 mb-4" />
        </div>
      ) : null}
      <a
        // className="link"
        className="text-green-600 font-bold  bg-stone-100 m-auto mt-12 mb-32 py-2 px-20 rounded-md shadow-2xl"
                href="https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=jkmf4-caaaa-aaaal-amq3q-cai"
        target="_blank"
        rel="noopener noreferrer"
      >
        Enlace a la interfaz candid del Backend
      </a>

      <footer className="App-footer">
        <div className="footer-title">Wave Lab Tech</div>
        <ul className="footer-links">
          <li><a href="https://www.linkedin.com/company/wavelabs-tech/">Wave-Labs Linkedin</a></li>
          <li><a href="https://wave-labs.tech">Wave-Labs web</a></li>
          {/* <li><a href="#">Link 3</a></li> */}
        </ul>
      </footer>
    </div>
  );
}

export default App;
