import React, { useState, useEffect, useContext }  from "react";
import Navbar from "../navbar/NavBar";
import { createActor } from "../../declarations/backend";
import { AuthContext } from '../../context/AuthContext';
import { Principal } from "@dfinity/principal";
import CardTile from "../cardTile/CardTile";
// import { GetPublicCardsResult } from "../declarations/backend/backend.did";

interface GetPublicCardsResult {
  Ok: {
    cardsPreview: any[];
    thereIsMore: boolean;
  };
}

export default function Dashboard({ reverse = false }) {
//   const { contract, userAddress, isConnected, companyId } = useContract();
  const [data,] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [cardData, setCardData] = useState([]);
  const [cardData, setCardData] = useState<GetPublicCardsResult>({
    Ok: { cardsPreview: [], thereIsMore: false }
  });
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
 
//ELIMINAR declaracion backend si es necesario
  const {identity } = useContext(AuthContext);
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

  useEffect(() => {
    const loadMoreCards = async () => {
      setLoading(true);
      try {
        const result = await backend.getPaginatePublicCards(BigInt(0)); // Suponiendo que page * 10 es el offset
        if ('Ok' in result) {
          setCardData(prevData => {
            if (!prevData) return result;
            
            return {
              ...result,
              Ok: {
                ...result.Ok,
                cardsPreview: [
                  ...(prevData.Ok?.cardsPreview || []),
                  ...result.Ok.cardsPreview
                ]
              }
            };
          });
          setHasMore(result.Ok.thereIsMore);
        }
      } catch (error) {
        console.error('Error al cargar más tarjetas:', error);
      } finally {
        setLoading(false);
      }
    
    // const fetchPublicCards = async () => {
    //   try {
    //     setLoading(true);
    //     const result = await backend.getPaginatePublicCards(BigInt(0));
    //     console.log("publicCards", result);
        
    //     // Verifica si el resultado es Ok antes de actualizar el estado
    //     // if ('Ok' in result) {
    //     //   setCardData(result);
    //     if ('Ok' in result) {
    //       setCardData(prevState => ({
    //         ...prevState,
    //         Ok: result.Ok
    //       }));
    //     } else {
    //       console.error('Error fetching public cards:', result);
    //       alert('Error fetching public cards');
    //     }
    //   } catch (error) {
    //     console.error('Error fetching public cards:', error);
    //     alert('Error fetching public cards');
    //   }finally{
    //     setLoading(false);
    //   }
    };
  
    // fetchPublicCards();
    loadMoreCards();
  }, []);

  if(loading) {
    return <div className="md:text-3xl font-bold text-white mb-10">Loading...</div>;
  }

  return (
    <>
      <div>
        <Navbar></Navbar>
          <div className="w-full flex flex-col justify-center place-items-center m-auto mt-32 text-center">
            <div className="flex flex-col items-center md:text-xl font-bold text-white">
              <h1 className="md:text-4xl font-bold text-white mb-10">
                La tarjeta de presentación del Siglo XXI</h1>
              <h2 className="md:text-3xl font-bold text-white mb-10">
                Una revolución en las interacciones profesionales</h2>
              <p className="w-4/5 py-2 px-12 md:text-xl font-bold text-stone-700 bg-stone-200 rounded-md">
              Una tarjeta que proporciona datos verificables propiedad del usuario y trazabilidad de las interacciones,
              eliminando tarjetas físicas y fomentando la sostenibilidad y la mejora de las relaciones profesionales en el mundo digital.</p>
            </div>
            <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
            </div >
            <div className="flex flex-col items-center">
              <h2 className="mt-12 font-bold text-stone-700 font-bold bg-stone-100 rounded-md py-2 px-20">
                Listado de Business Cards por categoría</h2>
                {Object.keys(cardData.Ok?.cardsPreview || {}).map((profession) => (
              <div key={profession} className="flex flex-col items-center mt-10 text-white gap-4">
                <h2 className="text-4xl text-center text-blue-900 font-bold bg-stone-100 rounded-md mt-4 py-2 px-20">{profession}</h2>
                <div className="flex flex-wrap justify-center gap-4">

                  {/* {(cardData.Ok?.cardsPreview[profession] || []).map((card, index) => (//- */}
                  {Object.entries(cardData.Ok?.cardsPreview || {}).map(([category, cards]) => (
                  <div key={category} className="flex flex-col items-center mt-10 text-white gap-4">
                    <h2 className="text-4xl text-center text-blue-900 font-bold bg-stone-100 rounded-md mt-4 py-2 px-20">{category}</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                      {(cards || []).map((card: { cardId: number; }, index: React.Key | null | undefined) => (
                        <CardTile 
                          key={index} 
                          data={card}
                          cardId={card.cardId || index?.toString()}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                </div>
              </div>
            ))}
                  {/* {cardData && Object.keys(cardData).map((category) => (
                    <div key={category} className="flex flex-col items-center mt-10 text-white gap-4">
                      <h2 className="text-4xl text-center text-blue-900 font-bold bg-stone-100 rounded-md mt-4 py-2 px-20">{category}</h2>
                      <div className="flex justify-content mt-8 text-white gap-4"> */}
                      {/* {cardData[category].map((card, index) => (
        <div key={index} className="flex flex-col items-center">
          <CardTile data={card} />
          
          
          {card.contact? (
            <p className="text-blue-700 mt-4 text-2xl text-center font-bold bg-stone-100 rounded-md py-2 px-8">Soys contacto</p>
          ): card.shared ?(
            <p className="text-green-600 mt-4 text-2xl text-center font-bold bg-stone-100 rounded-md py-2 px-8">¡Te ha solicitado conexión!</p>
          ):  card.sharedOut ? (
            <p className="text-orange-600 mt-4 text-2xl text-center font-bold bg-stone-100 rounded-md py-2 px-8">
                Conexión enviada
            </p>
        ) : null}
        </div>
      ))} */}
                    
                      
                  
              <div className="flex justify-center mt-5 text-center text-white mt-12 mb-12 px-60" >
                {/* {userAddress && (
                  // <p>Wallet Address: {(userAddress.substring(0, 15) + '...')}</p>
                  <p className="text-stone-700 bg-stone-100 mt-20 py-1 px-6 w-fit border-2 border-stone-700 rounded-md shadow-2xl">Cuenta conectada: {(userAddress)}</p>
                )} */}
                {/* {!userAddress && (
                <div>
                  <p className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center text-white">Connect Your Wallet </p>
                  <button onClick={connectMetaMask} className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm mb-10">{connected ? "Connected" : "Connect"}</button>
                </div>
              )} */}
              </div>
            </div>
          </div>
        {/* )} */}
      </div>
    </>
  );
}  