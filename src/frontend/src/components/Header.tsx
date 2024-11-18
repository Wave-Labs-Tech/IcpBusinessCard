// src/components/Header.tsx
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext"; // Ajusta la ruta según la ubicación de AuthContext
import LoginButton from "../components/auth/LoginButton";
import LogoutButton from "../components/auth/LogoutButton";
import UserAvatarMenu from "./UserAvatarMenu";
import GeneralMenu from "./GeneralMenu";
import {BellIcon, ChatIcon } from '@heroicons/react/outline';
import { Notification } from "../declarations/backend/backend.did";

const filterNotifications = (n: Notification[]) => {
    return {
        msg: n.filter(notification => "Msg" in notification),
        notific: n.filter(notification =>  "Msg" in notification),
    };
};

const Header: React.FC = () => {
    const { isAuthenticated, cardDataUser, backend } = useContext(AuthContext);
    const [notifications, setNotifications] = useState<Notification[] | null>(null)


    const handleGetNotifications = async (kind: String) => {
        const response = await backend?.getMyNotifications();
        console.log(response)
        if(kind === "Msg") {return filterNotifications(response).msg}
        else {return  filterNotifications(response).notific} 
    }
    
    useEffect( () => {
        const getNotifications = async () => {  
            if(cardDataUser) {
                let n = await backend.getMyNotifications();
                if(n) { setNotifications(n) }
                console.log(cardDataUser.name, n)
            } else { 
                setNotifications(null) 
            }
        };
        console.log(notifications)
        if (cardDataUser && !notifications){ getNotifications()}
        if(!isAuthenticated){ setNotifications(null) }
    }, [backend, cardDataUser, isAuthenticated, notifications]);

    return (
        <header className="App-header">

            <div className="md:w-[60px]  flex items-center justify-center mr-[3vw]">
                {/* <MenuIcon className="h-10 text-gray-400 cursor-pointer" /> */}
                <GeneralMenu/>
            </div>

            <div className="w-8 h-8 flex items-center justify-center mr-[.5vw]">
                <ChatIcon className="md:h-10 md:w-10 text-gray-400 cursor-pointer
                    transition-transform duration-100 transform hover:scale-110 hover:text-gray-300"
                />
            </div>

            <div className="header-title"
                >ICP Business Card</div>

<div className="relative md:w-[70px] h-[70px] flex items-center justify-center mr-[3vw]">
    {/* Número de notificaciones */}
    {cardDataUser?.photo && notifications && (notifications.length > 0) && <div className="absolute top-30 right-[20%] z-50 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
         style={{ transform: 'translate(50%, -50%)' }} 
    >
        {notifications.length}
    </div>}
    {/* Ícono de campanita */}
    <BellIcon
        className="md:h-8 md:w-8 h-8 w-8 text-gray-400 cursor-pointer transition-transform duration-100 transform hover:scale-110 hover:text-gray-300"
        onClick={handleGetNotifications}
    />
</div>
            <div className="md:w-[100px] h-[70px] flex items-center justify-center ml-[5px]"
                style={{minWidth: "50px"}}
            >
                {!isAuthenticated ? <LoginButton /> : cardDataUser ? <UserAvatarMenu /> : <LogoutButton />}
                {/* <LogoutButton/> */}
            </div>
        </header>
    );
};

export default Header;
