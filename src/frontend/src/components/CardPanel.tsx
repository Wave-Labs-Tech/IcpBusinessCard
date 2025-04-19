import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import CardPreview from './CardPreview';
import { Principal } from "@dfinity/principal";
import { AuthContext } from "../context/AuthContext";
import { CompleteCardData } from '../declarations/backend/backend.did';




const CardPanel: React.FC = () => {

    const observer = useRef<IntersectionObserver | null>(null);

    const { isAuthenticated, backend, identity, cardDataUser } = useContext(AuthContext);
    const [cardList, setCardsList] = useState<any[]>([]);
    const [hasNext, setHasNext] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false)
    const [selectedCard, setSelectedCard] = useState<CompleteCardData | null>(null)

    const loadCards = async () => {
        if (!hasNext || loading) return;
        setLoading(true);
        setCurrentPage(currentPage + 1)
        const response = await backend.getPaginatePublicCards(BigInt(currentPage));
        if ("Ok" in response) {
            setCardsList(prev => [...prev, response.Ok.cardsPreview])
            setHasNext(response.Ok.hasMore)
            console.log(response.Ok)

        } else {
            console.log(response)
        }
    }

    const lastCardRef = useCallback<(node: Element | null) => void>(
        (node) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            
            observer.current = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
                if (entries[0].isIntersecting && hasNext) {
                    loadCards();
                }
            });
    
            if (node) observer.current.observe(node);
        },
        [loading, hasNext]
    );

    const onCardClick = async (owner: Principal) => {
        try {
            const response = await backend.getCardByPrincipal(owner);
            if ("Ok" in response) {
                setSelectedCard(response.Ok); // Guarda los datos completos de la tarjeta en el estado
            } else {
                console.error("Error al obtener los detalles de la tarjeta:", response.Err);
            }
        } catch (error) {
            console.error("Error al llamar a getCardByPrincipal:", error);
        }
    };

    return (
        <div
            className="relative flex items-center justify-center w-full max-w-md sm:max-w-3xl lg:max-w-6xl mx-auto"
        >
            <div className="overflow-hidden w-full flex items-left justify-left">
                <div
                    
                    className="flex gap-4 transition-transform duration-300"
                    style={{
                        // transform: `translateX(-${currentIndex * 250}px)`,
                        paddingLeft: '100px',  // Añade un padding izquierdo para evitar que las tarjetas queden cortadas en móviles
                        paddingRight: '900px'
                    }}
                >
                    {cardList.map((cardPreview, index) => (
                        <div 
                            key={index}
                            ref={index === cardList.length - 1 ? lastCardRef : null}
                            className="w-60 flex-shrink-0" 
                            onClick={() => onCardClick(cardPreview.owner)}
                        >
                            <CardPreview card={cardPreview} />
                        </div>
                    ))}
                </div>
            </div>


        </div>

    );
};

export default CardPanel;
