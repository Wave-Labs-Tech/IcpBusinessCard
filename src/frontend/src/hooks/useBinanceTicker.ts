import { useEffect, useRef, useState } from "react";

export const useBinanceTicker = (asset: string) => {
    const [price, setPrice] = useState<number | null>(null);
    const [colorPrice, setColorPrice] = useState("text-white");
    const wsRef = useRef<WebSocket | null>(null);
    const lastPriceRef = useRef<number | null>(null);
    const lastPricesRef = useRef<Record<string, number>>({});

    useEffect(() => {
        // Cerrá el anterior si existía
        const oldSocket = wsRef.current;
        if (oldSocket && oldSocket.readyState === WebSocket.OPEN) {
          oldSocket.close();
        }
        const cachedPrice = lastPricesRef.current[asset];
        if (cachedPrice) {
            setPrice(cachedPrice);
            lastPriceRef.current = cachedPrice;
        } else {
            setPrice(null)
        }
      
        // Creamos nuevo socket
        const socket = new WebSocket(`wss://stream.binance.com:9443/ws/${asset}usdt@ticker`);
        wsRef.current = socket;
      
      
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.c) {
            const currentPrice = Number(data.c);
            const lastPrice = lastPriceRef.current;
            lastPricesRef.current[asset] = currentPrice;
      
            if (lastPrice !== null && currentPrice !== lastPrice) {
              setColorPrice(currentPrice > lastPrice ? "text-green-500" : "text-red-500");
            }
      
            lastPriceRef.current = currentPrice;
            setPrice(currentPrice);
          }
        };
      
        socket.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
        };
      
        // Cleanup garantizado del socket cuando cambia el asset o se desmonta
        return () => {
            if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
                socket.close();
                // setPrice(null)
                wsRef.current = null;
            }
          };
          
      }, [asset]);
      

    return { price, colorPrice };
};
