import React from "react";

interface DisconnectModalProps {
    isDisconnecting: boolean;
    onClose: () => void;
    onDisconnect: () => void;
}

const DisconnectModal: React.FC<DisconnectModalProps> = ({ onClose, onDisconnect, isDisconnecting }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-700 w-[90%] max-w-md p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-white">Confirmar desconexión</h2>
                <p className="text-gray-300">
                    ¿Estás seguro de que deseas desconectarte del usuario?
                </p>
                <div className="flex justify-end mt-6 space-x-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Cancelar
                    </button>
                    {isDisconnecting ? <div
                        className="spinner border-t-2 border-l-2 border-gray-200 w-12 h-12 rounded-full animate-spin"
                        style={{
                            alignSelf: "end",
                            marginBottom: "10px",
                            position: "relative",
                            top: "-40px",
                            right: "-25px",
                            minWidth: "30px"
                        }}
                    /> : <button
                        onClick={onDisconnect}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Desconectar
                    </button>}
                </div>
            </div>
        </div>
    );
};

export default DisconnectModal;
