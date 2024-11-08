// CardPreview.tsx
import React, { useEffect, useState } from 'react';

interface CardPreviewProps {
    card: {
        owner: string;
        name: string;
        photoPreview: Uint8Array; // Cambiado a Uint8Array
        profession: string;
        skills: string[];
        positions: any[];
        certificates: any[];
    };
}

// Convertir Uint8Array a Base64
function uint8ArrayToBase64(uint8Array: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
}

const CardPreview: React.FC<CardPreviewProps> = ({ card }) => {
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    useEffect(() => {
        if (card.photoPreview && card.photoPreview.length > 0) {
            // Convertir Uint8Array a Base64 y crear URL de imagen
            const base64Image = "data:image/png;base64," + uint8ArrayToBase64(card.photoPreview);
            setPhotoUrl(base64Image);  // Guardar la URL de la imagen en base64 en el estado
        }
    }, [card.photoPreview]);

    return (
        <button type="button" className="transition-transform duration-300 transform hover:scale-105">
    <div className="bg-gray-800 shadow-lg rounded-lg p-4 m-2 flex flex-col items-center w-60 h-80 border border-gray-700 hover:border-green-500 transition-colors duration-300">
        {photoUrl ? (
            <img src={photoUrl} alt={`${card.name} preview`} className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-green-500 shadow-md" />
        ) : (
            <div className="w-24 h-24 bg-gray-700 rounded-full mb-4 border-2 border-gray-600" />
        )}
        <h3 className="text-lg font-semibold text-green-300">{card.name}</h3>
        <p className="text-sm text-gray-400">{card.profession}</p>
        <div className="mt-2">
            <h4 className="text-xs font-semibold text-green-400">Skills:</h4>
            <ul className="text-xs text-gray-300 list-disc list-inside">
                {card.skills.slice(0, 3).map((skill, index) => (
                    <li key={index}>{skill}</li>
                ))}
            </ul>
        </div>
    </div>
</button>
    );
};

export default CardPreview;
