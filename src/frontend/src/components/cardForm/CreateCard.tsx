import React, { useState } from 'react';
import FormComponent from './FormComponent'; // Importa el formulario
import Navbar from '../navbar/NavBar';

const CreateCard: React.FC = () => {
    const [showForm, setShowForm] = useState(false); // Estado para mostrar/ocultar el formulario

    const handleCreateCardClick = () => {
        setShowForm(true); // Mostrar el formulario al hacer clic
    };

    return (
        <div className="w-full flex flex-col place-items-center mb-12">
            <Navbar/>
            <button className="font-bold mt-32 w-2/5 bg-stone-200 text-stone-800 rounded p-2 shadow-lg hover:scale-105"
             onClick={handleCreateCardClick}>Create Card</button>

            {/* Mostrar el formulario solo si el estado showForm es true */}
            {showForm && (
                <div>
                    <h2 className="text-stone-200 bg-stone-700 m-auto mt-12 mb-4 py-1 px-20 w-fit border-2 border-stone-700 rounded-md shadow-2xl">Create Your Business Card</h2>
                    <FormComponent /> {/* Renderiza el componente del formulario */}
                </div>
            )}
        </div>
    );
};

export default CreateCard;