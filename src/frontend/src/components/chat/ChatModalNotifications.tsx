import React from "react";
import { Principal } from "@dfinity/principal";
import { Mail } from '@heroicons/react/outline';
import { MailIcon } from "@heroicons/react/outline";

interface Msg {
    nameSender: String; 
    sender: Principal;
    chatId: number;
}

interface ChatNotificationProps {
    msgs: Msg[];
    onClose: () => void; 
    onSelectMessage: (msg: Msg) => void; 
}

const ChatModalNotification: React.FC<ChatNotificationProps> = ({ msgs, onClose, onSelectMessage }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-700 w-[90%] max-w-lg p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">Mensajes recientes</h2>
                <ul className="text-left">
                    {msgs.length > 0 ? (
                        msgs.map((msg, index) => (
                            <li
                                key={index}
                                className="hover:text-green-500 cursor-pointer mb-2 border-b border-gray-600 pb-2"
                                onClick={() => onSelectMessage(msg)}
                            >
                                <div className="flex items-center">
                                    <MailIcon className="h-5 w-5 mr-5"></MailIcon>
                                    
                                    <div>
                                        <p className="font-bold">{msg.nameSender} Te ha enviado un mensaje</p>
                                        {/* <p className="text-sm text-gray-400">ID de chat: {msg.chatId}</p> */}
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="text-gray-500">No hay notificaciones</li>
                    )}
                </ul>
                <button
                    onClick={onClose}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};

export default ChatModalNotification;
