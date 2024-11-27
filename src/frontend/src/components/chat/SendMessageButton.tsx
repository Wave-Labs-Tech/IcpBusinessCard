import React, { useState, useContext } from 'react';
import { createActor } from '../../declarations/backend';

interface SendMessageButtonProps {
    owner: string; // ID del dueño de la tarjeta
}



const SendMessageButton: React.FC<SendMessageButtonProps> = ({ owner }) => {


    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        // setIsSending(true);
        // try {
        //     const response = await backend.sendMessageToOwner(owner, message);
        //     if ("Ok" in response) {
        //         alert("Mensaje enviado con éxito.");
        //         setMessage(""); // Limpia el campo después de enviar
        //     } else if ("Err" in response) {
        //         alert(`Error al enviar el mensaje: ${response.Err}`);
        //     }
        // } catch (error) {
        //     console.error("Error al enviar mensaje:", error);
        //     alert("Error al intentar enviar el mensaje.");
        // } finally {
        //     setIsSending(false);
        // }
    };

    return (
        <div className="flex flex-col items-end mt-4">
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                className="bg-gray-700 text-gray-200 rounded-lg p-2 w-full mb-2 resize-none"
                rows={3}
                maxLength={500}
                style={{ minWidth: "200px" }}
            ></textarea>
            <button
                onClick={handleSendMessage}
                disabled={isSending || !message.trim()}
                className={`${
                    isSending ? "bg-gray-500" : "bg-green-500"
                } text-gray-800 rounded-lg px-3 py-1 mt-1`}
                style={{
                    alignSelf: "end",
                }}
            >
                {isSending ? "Enviando..." : "Enviar mensaje"}
            </button>
        </div>
    );
};

export default SendMessageButton;
