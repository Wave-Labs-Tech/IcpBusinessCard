import React, { useState } from 'react';
import FormComponent from './FormComponent'; // Importa el formulario

const CreateCard: React.FC = () => {
    const [showForm, setShowForm] = useState(false); // Estado para mostrar/ocultar el formulario

    const handleCreateCardClick = () => {
        setShowForm(true); // Mostrar el formulario al hacer clic
    };

    return (
        <div>
            <button onClick={handleCreateCardClick}>Create Card</button>

            {/* Mostrar el formulario solo si el estado showForm es true */}
            {showForm && (
                <div>
                    <h2>Create Your Business Card</h2>
                    <FormComponent /> {/* Renderiza el componente del formulario */}
                </div>
            )}
        </div>
    );
};

export default CreateCard;