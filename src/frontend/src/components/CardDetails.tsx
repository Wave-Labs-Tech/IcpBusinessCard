import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { uint8ArrayToBase64 } from "../utils/imageProcess";
import { CompleteCardData } from "../declarations/backend/backend.did";
// import SendMessageButton from './chat/SendMessageButton';
import ConnectButton from './ConnectButton';
import CardEditButton from './CardEditButton';
import { UserIcon } from '@heroicons/react/outline';
// import { relative } from 'path';

interface CardDetailsProps extends CompleteCardData {
    isOpen: boolean;
    onClose: () => void;
}

const CardDetails: React.FC<CardDetailsProps> = ({ isOpen, onClose, ...dataCard }) => {
    const { backend, cardDataUser } = useContext(AuthContext);
    const [photoUrl, setPhotoUrl] = useState<string>("");
    const [showReviewsPopup, setShowReviewsPopup] = useState(false);
    const [showCertificatesPopup, setShowCertificatesPopup] = useState(false);
    const [connectButtom, setConnectButtom] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showAll, setShowAll] = useState(false);

    const MAX_ITEMS = 4; // Número máximo de elementos a mostrar
    const MAX_LENGTH = 30; // Longitud máxima de cada texto

    const truncateText = (text: string, maxLength: number) => {
        return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
    };

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

    useEffect(() => {
        if (!dataCard) {
            setConnectButtom("")
        } else {
            if ("None" in dataCard.relationWithCaller) {
                setConnectButtom("Connect")
            } else if ("Contact" in dataCard.relationWithCaller) {
                setConnectButtom("Connected")
            } else if ("ContactInvited" in dataCard.relationWithCaller) {
                setConnectButtom("Pending")
            } else if ("ContactRequester" in dataCard.relationWithCaller) {
                setConnectButtom("Accept")
            }
        }

    }, []);

    const handleShareCard = async () => {
        setIsLoading(true); // Inicia el spinner
        try {
            let shareResponse = await backend.shareCard(dataCard.owner);
            if("Ok" in shareResponse){
                if("Contact" in shareResponse.Ok) {
                    setConnectButtom("Connected")
                } else if ("ContactRequester" in shareResponse.Ok) {
                    
                    setConnectButtom("Pending")
                }
                console.log(connectButtom)
                console.log(shareResponse.Ok)
            } else if("Err" in shareResponse){
                console.log(shareResponse.Err)
                
            }
        } catch (error) {
            console.error("Error al compartir la tarjeta:", error);
        } finally {
            setIsLoading(false); // Detiene el spinner
        }
    };
    const visibleSkills = showAll
        ? dataCard.keyWords
        : dataCard.keyWords.slice(0, MAX_ITEMS);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-800 text-gray-100 p-4 rounded-[30px]  md:h-[420px] w-[82vw] h-[80vh] w-80% max-w-[800px]
                mx-auto flex flex-col md:flex-row items-center md:items-start"

                onClick={(e) => e.stopPropagation()}
                style={{ boxShadow: "0 0 18px 10px rgba(255, 255, 255, 0.4)" }}>
                {/* Foto de perfil */}
                <div className="w-full md:w-1/3 flex items-center justify-center mb-4 md:mb-0">
                    {(photoUrl && photoUrl.length > 512) ? (
                        <img
                            src={photoUrl}
                            alt=""
                            className="w-[200px] h-[200px] md:w-[350px] md:h-[400px] rounded-full object-cover"
                        />
                    ) : (
                        <UserIcon className="w-[200px] h-[200px] md:w-[350px] md:h-[400px] rounded-full bg-gray-700" />
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
                    <section className="mb-4 w-full text-left pl-3">
            {/* <h3 className="text-md font-semibold text-green-400">Descripción de Servicio:</h3> */}
            <ul className="list-disc list-inside text-gray-300 pl-4">
                {visibleSkills.map((skill, index) => (
                    <li key={index}>{truncateText(skill, MAX_LENGTH)}</li>
                ))}
            </ul>
            {/* Botón para alternar entre ver más/ver menos */}
            {dataCard.keyWords.length > MAX_ITEMS && (
                <button
                    className="mt-2 text-green-400 hover:underline"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? "Ver menos" : "Ver más"}
                </button>
            )}
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
                            {dataCard.links.map((link, index) => {

                                const cleanLink = link.replace(/^(Link:|Social:)/, '').trim();
                                const absoluteUrl = cleanLink.startsWith('http://') || cleanLink.startsWith('https://')
                                    ? cleanLink
                                    : `https://${cleanLink}`;

                                return (
                                    <li key={index}>
                                        <a href={absoluteUrl} target="_blank" rel="noopener noreferrer" className="text-green-300 underline hover:text-green-400">
                                            {cleanLink.replace(/^(https?:\/\/)/, '')}
                                        </a>
                                    </li>
                                );
                            })}
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
        

                {cardDataUser && (
                    !("Self" in dataCard.relationWithCaller) ?
                        (<ConnectButton
                            isLoading={isLoading}
                            connectButtonText={connectButtom}
                            handleShareCard={("ContactRequester" in dataCard.relationWithCaller || "None" in dataCard.relationWithCaller) ? handleShareCard : () => {}}
                            isDisabled={isLoading}
                        />):
                        <CardEditButton/>
                )}
            </div>
        </div>
    );
};

export default CardDetails;
