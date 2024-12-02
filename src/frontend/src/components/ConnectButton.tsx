import React, { useState, useContext, useEffect } from 'react';

import DisconnectModal from "./DisconnectModal";
import { AuthContext } from '../context/AuthContext';
import { Principal } from "@dfinity/principal"

interface ConnectButtonProps {
    isLoading: boolean;
    connectButtonText: string;
    handleShareCard: () => void;
    updateTextButton: (text: string) => void;
    principal: Principal;
    isDisabled: boolean;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ isLoading, connectButtonText, handleShareCard, updateTextButton, principal, isDisabled }) => {
    let [showModalDisconnect, setShowModalDisconnect] = useState(false);
    let [isDisconnecting, setIsDisconnecting] = useState(false)
    let [textButton, setTextButton] = useState("")

    useEffect(() => {
          setTextButton(connectButtonText)
    }, [connectButtonText]);

    let { backend } =useContext(AuthContext)

    const handleCloseModal = () => {
        setShowModalDisconnect(false)
    }

    const handleDiconnect = async () => {
        console.log("desconectando")
        setIsDisconnecting(true);
        const response = await backend.disconnectCard(principal);
        if("Ok" in response){
            if("None" in response.Ok){
                updateTextButton("Connect")
            }
        };
        setIsDisconnecting(false);
        handleCloseModal();
        console.log(response);
        console.log("desconectado")
    }

    // const changeTextButton()

    return (
        <>
            <button
                className={`${connectButtonText === "Connected" && "bg-green-500 text-gray-800 rounded-lg pl-1 pr-1"}
                            ${ connectButtonText === "Pending"&& "bg-blue-700 text-white rounded-lg pl-1 pr-1"}
                            ${(connectButtonText === "Accept" || connectButtonText === "Connect") && "bg-blue-500 text-white rounded-lg pl-1 pr-1"}
                            } ${isLoading ? "h-0 bg-transparent" : "h-30"} transition-opacity duration-300`}
                style={{
                    alignSelf: "end",
                    padding: "4px 0px 4px 0px",
                    marginBottom: "10px",
                    position: "relative",
                    minWidth: "100px",
                    top: "10px",
                    right: "10px"
                }}
                onClick={connectButtonText !== "Connected" ? handleShareCard : () => { setShowModalDisconnect(true) }}
                disabled={isDisabled}
            >
                {isLoading ? (
                    <div
                        className="spinner border-t-2 border-l-2 border-gray-200 w-12 h-12 rounded-full animate-spin"
                        style={{
                            alignSelf: "end",
                            marginBottom: "10px",
                            position: "relative",
                            top: "-40px",
                            right: "-25px",
                            minWidth: "30px"
                        }}
                    />
                ) : (
                    textButton
                )}
            </button>
            {showModalDisconnect && (
                <DisconnectModal
                    isDisconnecting={isDisconnecting}
                    onDisconnect={handleDiconnect} 
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
};

export default ConnectButton;
