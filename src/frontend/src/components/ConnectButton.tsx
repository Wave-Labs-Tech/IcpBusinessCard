import React from 'react';

interface ConnectButtonProps {
    isLoading: boolean;
    connectButtonText: string;
    handleShareCard: () => void;
    isDisabled: boolean;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ isLoading, connectButtonText, handleShareCard, isDisabled }) => {
    return (
        <button
            className={`${connectButtonText === "Connect"
                ? "bg-green-500 text-gray-800 rounded-lg pl-1 pr-1"
                : "bg-gray-500 text-white rounded-lg pl-1 pr-1"
                } ${isLoading ? "h-0" : "h-30"} transition-opacity duration-300`}
            style={{
                alignSelf: "end",
                marginBottom: "10px",
                position: "relative",
                minWidth: "100px",
                top: "10px",
                right: "10px"
            }}
            onClick={handleShareCard}
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
                connectButtonText
            )}
        </button>
    );
};

export default ConnectButton;
