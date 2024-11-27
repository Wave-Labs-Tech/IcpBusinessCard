import React, { useEffect, useState, useRef } from 'react';
import CardPreview from './CardPreview';
import { Principal } from "@dfinity/principal";

interface CardGridProps {
    cards: any[];
    fetchCards: (startIndex: number) => Promise<void>;
    hasMore: boolean;
    onCardClick: (owner: Principal) => void;
}

const CardGrid: React.FC<CardGridProps> = ({ cards, fetchCards, hasMore, onCardClick }) => {
    const [page, setPage] = useState(0);
    const observer = useRef<IntersectionObserver | null>(null);

    // Llama a fetchCards cuando la página cambia
    useEffect(() => {
        fetchCards(page);
    }, [page, fetchCards]);

    // Detecta cuándo el usuario llega al final de la lista
    const lastCardRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (!hasMore || !lastCardRef.current) return;

        // Configuración del IntersectionObserver
        const callback: IntersectionObserverCallback = (entries) => {
            if (entries[0].isIntersecting) {
                setPage((prevPage) => prevPage + 1);
            }
        };

        observer.current = new IntersectionObserver(callback, {
            root: null,
            rootMargin: "200px",
            threshold: 1.0,
        });

        observer.current.observe(lastCardRef.current);

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [hasMore]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {cards.map((card, index) => {
                const isLastCard = index === cards.length - 1;
                return (
                    <div
                        key={index}
                        className="w-full h-auto bg-gray-100 rounded-lg shadow-lg cursor-pointer"
                        onClick={() => onCardClick(card.owner)}
                        ref={isLastCard ? lastCardRef : null}
                    >
                        <CardPreview card={card} />
                    </div>
                );
            })}
        </div>
    );
};

export default CardGrid;
