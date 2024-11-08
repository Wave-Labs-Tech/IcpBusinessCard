import React, { useEffect, useState } from 'react';
import { uint8ArrayToBase64 } from "../utils/imageProcess";
import { CompleteCardData } from "../declarations/backend/backend.did";

const CardDetails: React.FC<CompleteCardData> = (dataCard) => {
    const [photoUrl, setPhotoUrl] = useState<string>("");
    const [showReviewsPopup, setShowReviewsPopup] = useState(false);
    const [showCertificatesPopup, setShowCertificatesPopup] = useState(false);

    useEffect(() => {
        if (dataCard.photo && dataCard.photo.length > 0) {
            if (dataCard.photo instanceof Uint8Array) {
                const base64Image = "data:image/png;base64," + uint8ArrayToBase64(dataCard.photo);
                setPhotoUrl(base64Image);
            } else {
                console.error("La foto no es un Uint8Array");
            }
        }
    }, [dataCard.photo]);

    return (
        <div className="mt-8 bg-gray-800 text-gray-100 p-4 rounded-[30px] w-full max-w-[800px] mx-auto flex flex-col md:flex-row items-center md:items-start h-[90vh] md:h-[420px]"

            style={{ boxShadow: "0 0 18px 10px rgba(255, 255, 255, 0.4)"}}>
            {/* Foto de perfil */}
            <div className="w-full md:w-1/3 flex items-center justify-center mb-4 md:mb-0">
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt=""
                        className="w-[200px] h-[200px] md:w-[350px] md:h-[400px] rounded-full object-cover"
                    />
                ) : (
                    <div className="w-[200px] h-[200px] md:w-[350px] md:h-[400px] rounded-full bg-gray-700" />
                )}
            </div>

            {/* Información principal de la tarjeta */}
            <div className="w-full md:w-2/3 flex flex-col items-center md:items-start">
                {/* Encabezado: Nombre y Profesión */}
                <div className="flex flex-col md:flex-row justify-between w-full mb-4 text-center md:text-left">
                    <div>
                        <h1 className="text-2xl font-bold text-green-300">{dataCard.name}</h1>
                        <p className="text-xl text-gray-300 font-semibold">{dataCard.profession}</p>
                    </div>
                    <div className="mt-2 md:mt-0 text-right">
                        <p className="text-sm text-gray-400">Score: <span className="font-semibold text-green-300">{dataCard.score.toString()}</span></p>
                        <p className="text-sm text-gray-400">Contacts: <span className="font-semibold text-green-300">{dataCard.contactQty.toString()}</span></p>
                    </div>
                </div>
                <hr className="border-gray-300 w-full my-2" />

                {/* Skills */}
                <section className="mb-4 w-full text-left">
                    <h3 className="text-md font-semibold text-green-400">Skills:</h3>
                    <ul className="list-disc list-inside text-gray-300 pl-4">
                        {dataCard.skills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                        ))}
                    </ul>
                </section>

                {/* Positions */}
                {dataCard.positions.length > 0 && (
                    <section className="mb-4 text-left bg-gray-900 rounded-lg p-2 w-full">
                        <h3 className="text-lg font-semibold text-green-400">Positions:</h3>
                        <ul className="text-gray-300 pl-4">
                            {dataCard.positions.map((position, index) => (
                                <li key={index} className="mb-2">
                                    <p className="font-semibold">{position.position} at {Number(position.company)}</p>
                                    <p className="text-sm">{new Date(Number(position.startDate)).toLocaleDateString()} - {position.endDate ? new Date(Number(position.endDate)).toLocaleDateString() : 'Present'}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Certificados */}
                {dataCard.certificates.length > 0 && (
                    <section className="mb-4">
                        <h3 className="text-lg font-semibold text-green-400">
                            <button onClick={() => setShowCertificatesPopup(true)} className="text-green-300 underline">Certificates</button>
                        </h3>
                    </section>
                )}

                {/* Reseñas */}
                {dataCard.reviews.length > 0 && (
                    <section className="mb-4">
                        <h3 className="text-lg font-semibold text-green-400">
                            Reviews: <button onClick={() => setShowReviewsPopup(true)} className="text-green-300 underline">Show</button>
                        </h3>
                    </section>
                )}

                {/* Links */}
                <section className="w-full">
                    <hr className="border-gray-300 my-2" />
                    <ul className="text-gray-300 list-disc list-inside pl-4">
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

            {/* Popup para Certificados */}
            {showCertificatesPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md">
                        <h3 className="text-lg font-semibold text-green-400 mb-4">Certificates</h3>
                        <ul className="text-gray-300 list-disc list-inside pl-4">
                            {dataCard.certificates.map((cert, index) => (
                                <li key={index} className="mb-2">
                                    <p className="font-semibold">{cert.title}</p>
                                    <p className="text-sm">{cert.institution} - {new Date(Number(cert.date)).toLocaleDateString()}</p>
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowCertificatesPopup(false)} className="mt-4 text-green-300 underline">Close</button>
                    </div>
                </div>
            )}

            {/* Popup para Reseñas */}
            {showReviewsPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md">
                        <h3 className="text-lg font-semibold text-green-400 mb-4">Reviews</h3>
                        <ul className="text-gray-300 list-disc list-inside pl-4">
                            {dataCard.reviews.map((review, index) => (
                                <li key={index} className="text-sm">{review}</li>
                            ))}
                        </ul>
                        <button onClick={() => setShowReviewsPopup(false)} className="mt-4 text-green-300 underline">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CardDetails;
