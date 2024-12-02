import React, { useEffect, useState } from 'react';
import { CardPreview as CardPreviewType } from '../declarations/backend/backend.did';
import { UserIcon } from '@heroicons/react/outline';


interface CardPreviewProps {
    card : CardPreviewType
}

function uint8ArrayToBase64(uint8Array: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
}

const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const CardPreview: React.FC<CardPreviewProps> = ({card}) => {
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    useEffect(() => {
        if (card.photoPreview && card.photoPreview.length > 0) {
            // Convertir Uint8Array a Base64 y crear URL de imagen
            if(card.photoPreview instanceof(Uint8Array)){
               const base64Image = "data:image/png;base64," + uint8ArrayToBase64(card.photoPreview);
               setPhotoUrl(base64Image);  // Guardar la URL de la imagen en base64 en el estado
            }     
        }
    }, [card.photoPreview]);

    return (
        <button type="button" className="transition-transform duration-300 transform hover:scale-105 z-20">
            
            
            <div className="bg-[#303040] shadow-lg rounded-lg p-4 m-2 flex flex-col items-center w-60 h-80 border 
             border-teal-400 hover:border-blue-600 transition-colors duration-300">
                {(photoUrl &&( photoUrl.length > 512)) ? (
                    <img src={photoUrl} alt={`${card.name}`} className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-teal-400" />
                ) : (
                    <UserIcon className="h-24 h-24 mb-2 border-2 border-blue-800 rounded-full bg-gray-700 text-gray-500"/>
                    // <div className="w-24 h-24 bg-gray-700 rounded-full mb-4 border-2 border-gray-600" />
                )}
                <h3 className="text-lg font-semibold text-gray-100">{card.name}</h3>
                <p className="text-sm text-gray-200">{card.profession}</p>
                <div className="mt-2">
                    {/* <h4 className="text-xs font-semibold text-green-400">Descripción de Servicio:</h4> */}
                    <ul className="text-xs text-gray-300 list-disc list-inside text-left">
                        {card.keyWords.slice(0, 3).map((keyWords, index) => (
                            <li key={index}>{truncateText(keyWords, 20)}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </button>
    );
};

export default CardPreview;
