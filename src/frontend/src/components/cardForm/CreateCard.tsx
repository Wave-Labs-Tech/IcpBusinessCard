import React, { useState } from 'react';
import FormComponent from './FormComponent';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../components/auth/styles.css';

type CreateCardProps = {
    onFormSubmit: () => void;
  };

const CreateCard: React.FC<CreateCardProps> = ({ onFormSubmit }) => {
    const [showForm, setShowForm] = useState(false); // Estado para mostrar/ocultar el formulario

    const handleCreateCardClick = () => {
        setShowForm(true); // Mostrar el formulario al hacer clic
    };

    const handleFormSubmit = () => {
        onFormSubmit(); 
        setShowForm(false); // Ocultar el formulario después del submit
        toast.success("¡Formulario enviado con éxito!"); // Mostrar toast de éxito
    };

    return (
        <div>
            {!showForm && (
                // <button className="button" onClick={handleCreateCardClick}>
                <button className="w-120 bg-green-300 rounded-md py-3 px-32" onClick={handleCreateCardClick}>
                    Create Card</button>
            )}

            {showForm && (
                <div className="flex flex-col items-center place-content-center">
                    <h2 className="w-fit text-green-600 font-bold bg-stone-100 mt-12 mb-4 py-2 px-20 rounded-md shadow-2xl">Create Your Business Card</h2>
                    <FormComponent onSubmit={handleFormSubmit} /> {/* Pasamos handleFormSubmit como prop */}
                </div>
            )}

            <ToastContainer /> {/* Contenedor de toasts */}
        </div>
    );
};

export default CreateCard;
