import { MenuIcon } from '@heroicons/react/outline';
import React, { useState } from 'react';

const GeneralMenu: React.FC = () => {

    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <>
            <MenuIcon className="h-8 text-gray-400 cursor-pointer 
                transition-transform duration-100 transform hover:scale-110 hover:text-gray-300" 
                onClick={toggleMenu} 
            />
            
            {/* Menú deslizante*/}
            <div
                className={`
                    fixed top-0 left-0 h-full w-64 bg-gray-600 shadow-lg transform transition-transform duration-500
                    ${menuOpen ? "translate-x-0" : "-translate-x-full"} z-[1000] border border-gray-400
                `}
            >
                <h2 className="text-sg font-semibold p-4 bg-gray-700">General Menu</h2>
                <div className="p-4">
                    <ul className="space-y-4">
                        <li className="hover:text-green-500 cursor-pointer">
                            <a
                                target="_blank"
                                rel="noreferrer"
                                href="https://39iz3r3gr2o.typeform.com/to/m7n9oDwE"
                            >
                                Suggestions
                            </a>
                        </li>
                        <li className="hover:text-green-500 cursor-pointer">AI Chat</li>
                        <li className="hover:text-green-500 cursor-pointer">Help</li>
                        <li className="hover:text-green-500 cursor-pointer">Candid UI</li>
                        <li className="hover:text-green-500 cursor-pointer">Config</li>
                    </ul>
                </div>
            </div>

            {/* Fondo oscuro cuando el menú está abierto */}
            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 w-full z-[900]"
                    onClick={toggleMenu} // Cierra el menú al hacer clic fuera de él
                ></div>
            )}
        </>
    );
}

export default GeneralMenu;
