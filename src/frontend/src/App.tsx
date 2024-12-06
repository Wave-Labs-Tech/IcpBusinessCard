/* eslint-disable array-callback-return */
import React, { useState, useContext, useEffect, useCallback, ChangeEvent } from 'react';
import './App.css';
import Header from './components/Header';
import { UserProfile } from './components/userProfile/UserProfile';
import { AuthContext } from './context/AuthContext';
import CardCarousel from './components/CardCarousel';
import { Principal } from "@dfinity/principal"
import { CompleteCardData } from './declarations/backend/backend.did';
import CardDetails from './components/CardDetails';


function App() {
  const { isAuthenticated, backend, identity, cardDataUser } = useContext(AuthContext);
  const [whoAmI, setWhoAmI] = useState(identity.getPrincipal().toText());
  const [cards, setCards] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);  // Estado para controlar si hay más tarjetas para cargar
  const [initialLoad, setInitialLoad] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CompleteCardData | null>(null);
  const [opacity, setOpacity] = useState<number>(0.65);

  let canisterId: string | undefined = process.env.REACT_APP_CANISTER_ID_BACKEND;

  if (!canisterId) {
    throw new Error("El canister ID no está definido.");
  }

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setOpacity(Number(event.target.value) / 100); // Normalizamos el valor entre 0 y 1
  };

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
    <div className="App flex flex-col min-h-screen w-full relative">
  {/* Capa semitransparente */}
  <div
    className="absolute inset-0 bg-black"
    style={{ opacity }}
  ></div>

  <div className="relative flex flex-col min-h-screen w-full select-none">
    <Header />
    {/* <NavBar /> */}

    {isAuthenticated ? (
      !cardDataUser && (
        <div>
          <UserProfile />
        </div>
      )
    ) : null}

    {selectedCard ? (
      <CardDetails
        {...selectedCard}
        isOpen={true}
        onClose={handleBackToCarousel}
      />
    ) : (
      <div>
        {cards.length > 0 && (
          <div className="additional-info" style={{padding: "0 2vw 0 2vw", width: "fit-content", margin: "1.5vh auto"}}>Public Cards</div>
        )}
        <div className="flex justify-center mt-4">
          <CardCarousel
            cards={cards}
            fetchCards={getPaginatePublicCards}
            hasMore={hasMore}
            onCardClick={handleCardClick}
          />
        </div>
      </div>
    )}

    <footer className="App-footer relative z-10">
      <ul className="footer-links md:h-[35px]">
        <li translate="no">
          <a href="https://wave-labs.tech/" target="blank">
            Wave Labs Tech Web Site
          </a>
        </li>
      </ul>
    </footer>
  </div>

  {/* Slider para controlar la opacidad */}
  <div className=" fixed bottom-[80px] left-[50%] transform -translate-x-1/2 z-10 flex items-center gap-4">
    <span  translate="no" className="text-yellow-500 text-xs select-none">☀️</span>
    <input
      type="range"
      min="0"
      max="100"
      value={opacity * 100}
      onChange={handleSliderChange}
      className="w-64 h-1 bg-gray-500 rounded-lg appearance-none"
    />
    <span className="text-blue-500 text-xs select-none">🌙</span>
  </div>
</div>

  );
};


export default App;
