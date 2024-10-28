import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
// import { backend } from '../../declarations/backend';
import {CompleteCardData} from "../../declarations/backend/backend.did";
import CreateCard from "../cardForm/CreateCard";


export function UserProfile() {
  const { isAuthenticated, identity, backend } = useContext(AuthContext);  // Accede a la autenticación
  const [cardData, setCardData] = useState<CompleteCardData | null>(null);  // Estado para los datos de la tarjeta
  const [error, setError] = useState<string | null>(null);  // Estado para los errores
  const [loading, setLoading] = useState(true);  // Estado para controlar el spinner de carga
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    const fetchCardData = async () => {
      if (isAuthenticated && backend) {
        try {
          // Hacemos la llamada al backend y casteamos la respuesta al tipo adecuado
          const response = await backend.getMyCard();
          console.log("From UserProfile backend.getMyCard() ", response)

          if ('Ok' in response) {
            setCardData(response.Ok);  // Si es Ok, actualizamos cardData con los datos de la tarjeta
          } else {      
            setError("Card not found");
          }
        } catch (err) {
          setCardData(null)
          console.error("Error fetching card data:", err);
          setError("An error occurred");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCardData();
  }, [isAuthenticated, identity, backend, formSuccess ]);

  const handleFormSuccess = () => {
    setFormSuccess(true);
  };

  if (loading) {
    return <div>Loading...</div>;
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
              <CreateCard onFormSubmit={handleFormSuccess} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
