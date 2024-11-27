import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CompleteCardData } from "../../declarations/backend/backend.did";
import FormModal from '../cardForm/FormModal';



export function UserProfile() {
  const { isAuthenticated, identity, backend } = useContext(AuthContext);  // Accede a la autenticación
  const [cardData, setCardData] = useState<CompleteCardData | null>(null);  // Estado para los datos de la tarjeta
  const [loading, setLoading] = useState(true);  // Estado para controlar el spinner de carga
  const [formSuccess, setFormSuccess] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  useEffect(() => {
    const fetchCardData = async () => {
      if (isAuthenticated && backend) {
        try {
          const response = await backend.getMyCard();
          if ('Ok' in response) {
            setCardData(response.Ok);
          } 
        } catch (err) {
          setCardData(null)
          console.error("Error fetching card data:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCardData();
  }, [isAuthenticated, identity, backend, formSuccess]);

  const handleFormSuccess = () => {
    setFormSuccess(true);
    setIsFormModalOpen(false);
  };

  const openFormModal = () => setIsFormModalOpen(true);
  const closeFormModal = () => setIsFormModalOpen(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {isAuthenticated && (
        <div>
          {!cardData  && (
            <div>
              <button onClick={openFormModal} className="bg-blue-600 mt-3 text-white py-2 px-4 rounded">
                Create your Card
              </button>
              <FormModal
                isOpen={isFormModalOpen}
                onClose={closeFormModal}
                onSubmit={handleFormSuccess}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
