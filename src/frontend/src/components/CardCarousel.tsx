import React, { useEffect, useState, useRef } from 'react';
import CardPreview from './CardPreview';

interface CardCarouselProps {
    cards: any[];
    fetchCards: (startIndex: number) => Promise<void>;
    hasMore: boolean;
}

const CardCarousel: React.FC<CardCarouselProps> = ({ cards, fetchCards, hasMore }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [page, setPage] = useState(0)
    const startX = useRef(0); // Posición inicial en X cuando empieza el toque
    const endX = useRef(0);   // Posición final en X cuando termina el toque

    useEffect(() => {
        if (currentIndex  > page * 10 + 3 && hasMore) {
            setPage(page + 1)
            console.log("get page ", page)
            fetchCards(page);  // Llamar para cargar más tarjetas
        }
    }, [page, currentIndex, cards.length, fetchCards, hasMore]);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, cards.length - 1));
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };

    // Maneja el toque inicial
    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
    };

    // Maneja el final del toque y determina la dirección del deslizamiento
    const handleTouchEnd = () => {
        const deltaX = startX.current - endX.current;

        if (deltaX > 50) {
            // Deslizar a la izquierda
            handleNext();
        } else if (deltaX < -50) {
            // Deslizar a la derecha
            handlePrev();
        }
    };

    // Captura el movimiento para actualizar endX
    const handleTouchMove = (e: React.TouchEvent) => {
        endX.current = e.touches[0].clientX;
    };

    return (
        <div
            className="relative flex items-center justify-center w-full max-w-md sm:max-w-3xl lg:max-w-6xl mx-auto"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Botón de navegación hacia atrás */}
            <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className= "p-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 z-10 hidden-on-mobile"
            >
                ◀
            </button>

            <div className="overflow-hidden w-full flex items-left justify-left">
                <div
                    className="flex gap-4 transition-transform duration-300"
                    style={{
                        transform: `translateX(-${currentIndex * 250}px)`,
                        paddingLeft: '100px',  // Añade un padding izquierdo para evitar que las tarjetas queden cortadas en móviles
                        paddingRight: '900px'
                      }}
                >
                    {cards.map((card, index) => (
                        <div key={index} className="w-60 flex-shrink-0">
                            <CardPreview card={card} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Botón de navegación hacia adelante */}
            <button
                onClick={handleNext}
                disabled={currentIndex === cards.length - 1 && !hasMore}
                className=" p-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 z-10 hidden-on-mobile"
            >
                ▶
            </button>
        </div>
        
    );
};

export default CardCarousel;
