import React, { useEffect, useState, useRef } from 'react';
import CardPreview from './CardPreview';
import { Principal } from "@dfinity/principal";

interface CardCarouselProps {
    cards: any[];
    fetchCards: (startIndex: number) => Promise<void>;
    hasMore: boolean;
}

interface CardDataInit {
    name: string;
    email: string;
    phone: string;
    description: string;
    photo: string | null;
}

interface Owner {
    _arr: Uint8Array;
    _isPrincipal: boolean;
    toText: () => string;
    toJSON: () => { principal: string };
}

// interface Card {
//     owner: Owner;
//     name: string;
//     profession: string;
//     certificates: any[];
//     photoPreview: Uint8Array | null;
//     positions: any[];
//     skils: string[];
// }


// Ejemplo de datos de prueba con tres tarjetas en un array
const testCardData = {
    cards: [
        {
            owner: "owner-principal-text", // Llamamos al método .toText() y guardamos el valor aquí
            name: "Steve McQueen",
            profession: "Actor",
            photoPreview: "blob:http://localhost:3000/f766b7a8-15ef-4d46-b3c2-5fa0b35cafb0",
            skils: ["Western", "Acción"]
        },
        {
            owner: "owner-principal-text", // Llamamos al método .toText() y guardamos el valor aquí
            name: "Gary Cooper",
            profession: "Actor",
            photoPreview: "blob:http://localhost:3000/cb115d25-d0b8-4466-b1b2-15833cb9360e",
            skils: ["Drama", "Comedia"]
        },
        {
            owner: "owner-principal-text", // Llamamos al método .toText() y guardamos el valor aquí
            name: "James Stewart",
            profession: "Actor",
            certificates: [],
            photoPreview: "blob:http://localhost:3000/04e9b4fb-51d6-446f-b5bb-d8531d01d89f",
            positions: [],
            skils: ["Drama", "Comedia", "Suspense"]
        },
        {
            owner: "owner-principal-text", // Llamamos al método .toText() y guardamos el valor aquí
            name: "Gary Cooper 4",
            profession: "Actor",
            certificates: [],
            photoPreview: new Uint8Array([255, 216, 255, 224, /* más bytes aquí */]),
            positions: [],
            skils: ["Drama", "comedia"]
        },
        {
            owner: "owner-principal-text", // Llamamos al método .toText() y guardamos el valor aquí
            name: "Gary Cooper 5",
            profession: "Actor",
            certificates: [],
            photoPreview: new Uint8Array([255, 216, 255, 224, /* más bytes aquí */]),
            positions: [],
            skils: ["Drama", "comedia"]
        },
        {
            owner: "owner-principal-text", // Llamamos al método .toText() y guardamos el valor aquí
            name: "Gary Cooper 6",
            profession: "Actor",
            certificates: [],
            photoPreview: new Uint8Array([255, 216, 255, 224, /* más bytes aquí */]),
            positions: [],
            skils: ["Drama", "comedia"]
        },
        {
            owner: "owner-principal-text", // Llamamos al método .toText() y guardamos el valor aquí
            name: "Gary Cooper 7",
            profession: "Actor",
            certificates: [],
            photoPreview: new Uint8Array([255, 216, 255, 224, /* más bytes aquí */]),
            positions: [],
            skils: ["Drama", "comedia"]
        }
    ],
    hasMore: true
};

const CardCarousel: React.FC<CardCarouselProps> = ({ cards, fetchCards, hasMore }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [page, setPage] = useState(0)
    const startX = useRef(0); // Posición inicial en X cuando empieza el toque
    const endX = useRef(0);   // Posición final en X cuando termina el toque
    // const containerRef = useRef<HTMLDivElement | null>(null); 

    // useEffect(() => {
    //     console.log("get page ", page)
    //     if (currentIndex  > page * 10 + 3 && hasMore) {
    //         setPage(page + 1)
    //         console.log("get page ", page)
    //         fetchCards(page);  // Llamar para cargar más tarjetas
    //     }
    // }, [page, currentIndex, cards.length, fetchCards, hasMore]);
    
    // const handleNext = () => {
    //     setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, cards.length - 1));
    // };

    // const handlePrev = () => {
    //     setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    // };

    // // Maneja el toque inicial
    // const handleTouchStart = (e: React.TouchEvent) => {
    //     startX.current = e.touches[0].clientX;
    // };

    // // Maneja el final del toque y determina la dirección del deslizamiento
    // const handleTouchEnd = () => {
    //     const deltaX = startX.current - endX.current;

    //     if (deltaX > 50) {
    //         // Deslizar a la izquierda
    //         handleNext();
    //     } else if (deltaX < -50) {
    //         // Deslizar a la derecha
    //         handlePrev();
    //     }
    // };
    
    // // Captura el movimiento para actualizar endX
    // const handleTouchMove = (e: React.TouchEvent) => {
    //     endX.current = e.touches[0].clientX;
    // };
    console.log("CARDS", cards);
    const PAGE_SIZE = 3; // Número de tarjetas por página


        useEffect(() => {
            if (page * PAGE_SIZE >= cards.length && hasMore) {
                fetchCards(cards.length); // Llama a fetchCards para cargar más si estamos al final de las actuales
            }
        }, [page, cards.length, hasMore, fetchCards]);
    
        const startIndex = page * PAGE_SIZE;
        const paginatedCards = cards.slice(startIndex, startIndex + PAGE_SIZE); // Obtiene las tarjetas de la página actual
    
        const handleNextPage = () => {
            if (startIndex + PAGE_SIZE < cards.length || hasMore) {
                setPage((prevPage) => prevPage + 1);
            }
        };
    
        const handlePrevPage = () => {
            if (page > 0) {
                setPage((prevPage) => prevPage - 1);
            }
        };
    // 
    return (
        <div className="flex flex-col items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 justify-items-center">
                {/* {testCardData.cards.map((card, index) => ( */}
                {paginatedCards.map((card, index) => (
                    <div key={index} className="w-full sm:w-auto">
                        <CardPreview card={card} />
                    </div>
                ))}
            </div>

            {/* Botones de paginación */}
            <div className="flex justify-center gap-4 mt-4">
                <button
                    onClick={handlePrevPage}
                    disabled={page === 0}
                    className="p-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-md"
                >
                    Anterior
                </button>
                <button
                    onClick={handleNextPage}
                    disabled={!hasMore && startIndex + PAGE_SIZE >= cards.length}
                    className="p-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-md"
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
};
export default CardCarousel;
