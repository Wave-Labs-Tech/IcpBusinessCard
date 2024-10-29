// CardDetails.tsx
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from "./../context/AuthContext"
import { uint8ArrayToBase64 } from "../utils/imageProcess";
import { CompleteCardData } from "../declarations/backend/backend.did";



// interface CardDetailsProps {
//     card: {
//         owner: string;
//         name: string;
//         photo: Uint8Array; // La imagen se recibe como Blob
//         profession: string;
//         skils: string[];
//         positions: {
//             title: string;
//             company: string;
//             startDate: string;
//             endDate?: string;
//         }[];
//         score: number;
//         rewiews: string[];
//         contactQty: number;
//         links: string[];
//         certificates: {
//             title: string;
//             institution: string;
//             issueDate: string;
//             expirationDate?: string;
//         }[];
//     };
// }

const CardDetails: React.FC<CompleteCardData> = (dataCard) => {
    const [photoUrl, setPhotoUrl] = useState<string>("");

    useEffect(() => {
        if (dataCard.photo && dataCard.photo.length > 0) {

            if (dataCard.photo instanceof Uint8Array) {
                const base64Image = "data:image/png;base64," + uint8ArrayToBase64(dataCard.photo);
                setPhotoUrl(base64Image);
                // Usa base64Image como desees
            } else {
                console.error("La foto no es un Uint8Array");
            } 
        }
    }, [dataCard.photo]);

    return (
        <div className="bg-gray-800 text-gray-100 p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto">
            {/* Foto de perfil y nombre */}
            <div className="flex flex-col items-center mb-6">
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt={`${dataCard.name} profile`}
                        className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-green-500 shadow-md"
                    />
                ) : (
                    <div className="w-32 h-32 bg-gray-700 rounded-full mb-4 border-4 border-gray-600" />
                )}
                <h1 className="text-2xl font-bold text-green-300">{dataCard.name}</h1>
                <p className="text-sm text-gray-400">{dataCard.profession}</p>
            </div>

            {/* Habilidades */}
            <section className="mb-4">
                <h3 className="text-lg font-semibold text-green-400">Skills:</h3>
                <ul className="list-disc list-inside text-gray-300">
                    {dataCard.skils.map((skill, index) => (
                        <li key={index}>{skill}</li>
                    ))}
                </ul>
            </section>

            {/* Experiencia laboral */}
            <section className="mb-4">
                <h3 className="text-lg font-semibold text-green-400">Positions:</h3>
                <ul className="text-gray-300">
                    {dataCard.positions.map((position, index) => (
                        <li key={index} className="mb-2">
                            <p className="font-semibold">{position.position} at {position.company? position.company.toString(): ""}</p>
                            <p className="text-sm">{position.startDate.toString()} {/* - {position.endDate || 'Present'} */}</p>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Calificación y cantidad de contactos */}
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-400">Score: <span className="font-semibold text-green-300">{dataCard.score.toString()}</span></p>
                <p className="text-sm text-gray-400">Contacted: <span className="font-semibold text-green-300">{dataCard.contactQty.toString()} times</span></p>
            </div>

            {/* Reseñas */}
            <section className="mb-4">
                <h3 className="text-lg font-semibold text-green-400">Reviews:</h3>
                <ul className="text-gray-300 list-disc list-inside">
                    {dataCard.rewiews.map((review, index) => (
                        <li key={index} className="text-sm">{review}</li>
                    ))}
                </ul>
            </section>

            {/* Certificados */}
            <section className="mb-4">
                <h3 className="text-lg font-semibold text-green-400">Certificates:</h3>
                <ul className="text-gray-300">
                    {dataCard.certificates.map((cert, index) => (
                        <li key={index} className="mb-2">
                            <p className="font-semibold">{cert.title}</p>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Links */}
            <section>
                <h3 className="text-lg font-semibold text-green-400">Links:</h3>
                <ul className="text-gray-300 list-disc list-inside">
                    {dataCard.links.map((link, index) => (
                        <li key={index}>
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-green-300 underline hover:text-green-400">
                                {link}
                            </a>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
};

export default CardDetails;
