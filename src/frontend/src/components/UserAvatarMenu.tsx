import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { uint8ArrayToBase64 } from "../utils/imageProcess";
import CardDetails from "./CardDetails";

const UserAvatarMenu: React.FC = () => {
    const { cardDataUser, logout, backend } = useContext(AuthContext);
    const [thumbnail, setThumbnail] = useState<string>("");
    const [menuOpen, setMenuOpen] = useState(false); // Estado para manejar el menú
    const [showMiCard, setShowMiCard] = useState(false);

    useEffect(() => {
        if (cardDataUser && cardDataUser.photoPreview && cardDataUser.photoPreview.length > 0) {
            if (cardDataUser.photoPreview instanceof Uint8Array) {
                const base64Image = "data:image/png;base64," + uint8ArrayToBase64(cardDataUser.photoPreview);
                setThumbnail(base64Image);
            } else {
                console.error("La foto no es un Uint8Array");
            }
        }
    }, [cardDataUser]);

    // Función para alternar el estado del menú
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // Función para abrir el CardDetails
    const handleOpenCardDetails = () => {
        setShowMiCard(true);
        setMenuOpen(false);
    };

    const handleShowPrincipal = async () => {
        alert("Principal ID:\n " + 
            cardDataUser?.owner +
            "\nWho Am i: \n" +
            await backend.whoAmI())        
            
    }

    // Función para cerrar el CardDetails
    const handleCloseCardDetails = () => {
        setShowMiCard(false);
    };

    const handleLoadImage = () => {

    }

    return (
        <>
            <img
                onClick={toggleMenu} // Abre/cierra el menú al hacer clic
                src={thumbnail}
                alt="User Avatar"
                className="
                    h-[50px] w-[50px] rounded-full object-cover border-2 border-green-300 
                    transition-transform duration-100 transform hover:scale-105 cursor-pointer
                "
            />

            {/* Menú deslizante*/}
            <div
                className={`
                    fixed top-0 right-0 h-full w-64 bg-gray-600 shadow-lg transform transition-transform duration-500
                    ${menuOpen ? "translate-x-0" : "translate-x-full"} z-[1000] border border-gray-400
                `}
            >
                <h2 className="text-sg font-semibold p-4 bg-gray-700">{cardDataUser?.name}</h2>
                <div className="p-4">

                    <ul className="space-y-4">
                        <li className="hover:text-green-500 cursor-pointer" onClick={handleLoadImage}>Cambiar Imagen</li>
                        <li className="hover:text-green-500 cursor-pointer" onClick={handleOpenCardDetails}>Mi Perfil</li>
                        <li className="hover:text-green-500 cursor-pointer" >Solicitudes</li>
                        <li className="hover:text-green-500 cursor-pointer" onClick={handleShowPrincipal}>Mis Datos</li>
                        <li className="hover:text-green-500 cursor-pointer">Mis Contactos</li>
                        <li className="hover:text-green-500 cursor-pointer">Mis Interacciones</li>
                        <li className="hover:text-green-500 cursor-pointer">Calendario</li>
                        <li className="hover:text-green-500 cursor-pointer">Configuración</li>
                        <li className="hover:text-red-500 h-[80px] pt-[60px]">
                            <span className="w-[100%] cursor-pointer" onClick={logout}>
                                Log Out
                            </span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Fondo oscuro cuando el menú está abierto */}
            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-[900]"
                    onClick={toggleMenu} // Cierra el menú al hacer clic fuera de él
                ></div>
            )}

            {showMiCard && cardDataUser && (
                <CardDetails 
                {...cardDataUser}
                isOpen={showMiCard}
                onClose={handleCloseCardDetails}
              />
            )}
        </>
    );
};

export default UserAvatarMenu;
