import React, { useState } from 'react';
import FormComponent from './FormComponent';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../components/auth/Button.css';

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
                <button className="button" onClick={handleCreateCardClick}>Create Card</button>
            )}

            {showForm && (
                <div>
                    <h2>Create Your Business Card</h2>
                    <FormComponent onSubmit={handleFormSubmit} /> {/* Pasamos handleFormSubmit como prop */}
                </div>
            )}

            <ToastContainer /> {/* Contenedor de toasts */}
        </div>
    );
};

export default CreateCard;
