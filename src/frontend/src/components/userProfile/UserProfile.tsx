import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { backend } from '../../declarations/backend';
import {CompleteCardData} from "../../declarations/backend/backend.did";
import CreateCard from "../cardForm/CreateCard";
import { createActor } from "../../declarations/backend";
import { Principal } from "@dfinity/principal";

export function UserProfile() {
  const { isAuthenticated, identity } = useContext(AuthContext);  // Accede a la autenticación
  const [cardData, setCardData] = useState<CompleteCardData | null>(null);  // Estado para los datos de la tarjeta
  const [error, setError] = useState<string | null>(null);  // Estado para los errores
  const [loading, setLoading] = useState(true);  // Estado para controlar el spinner de carga

  //ELIMINAR declaracion backend si es necesario
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
    const fetchCardData = async () => {
      if (isAuthenticated) {
        try {
          // Hacemos la llamada al backend y casteamos la respuesta al tipo adecuado
          const response = await backend.getMyCard();
          console.log("NO response", response);  // Agregamos un console.log para depurar

          if ('Ok' in response) {
            console.log("response", response);  // Agregamos un console.log para depurar
            console.log("response.Ok", response.Ok);  // Agregamos un console.log para depurar
            setCardData(response.Ok);  // Si es Ok, actualizamos cardData con los datos de la tarjeta
          } else {
            setError("Card not found");
          }
        } catch (err) {
          //MUESTRA ESTE ERROR Error fetching card data: Error: Invalid certificate: Signature verification failed
          console.error("Error fetching card data:", err);
          setError("An error occurred");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCardData();
  }, [isAuthenticated, identity]);

  if (loading) {
    return <div className="w-2/5 mt-24 py-2 px-12 md:text-xl font-bold text-stone-700 bg-stone-200 rounded-md">Loading...</div>;
  }

  return (
    <div>
      {isAuthenticated && (
        <div>
          {cardData ? (
            <div>
              <h1>My Card</h1>
              <p>Name: {cardData.name}</p>
              <p>Email: {cardData.email}</p>
              {/* <p>Contacts: {cardData.contactQty}</p> */}
            </div>
          ) : (
            <div>
              <CreateCard/>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
