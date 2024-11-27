import React, { useContext, useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";
import { AuthContext } from "../context/AuthContext";
import LoginButton from "../components/auth/LoginButton";
import LogoutButton from "../components/auth/LogoutButton";
import UserAvatarMenu from "./UserAvatarMenu";
import CardDetails from "./CardDetails";
import GeneralMenu from "./GeneralMenu";
import { BellIcon, ChatIcon } from '@heroicons/react/outline';
import { Notification, CompleteCardData } from "../declarations/backend/backend.did";
import NotificationModal from "./NotificationModal";
import ChatModalNotifications from "./chat/ChatModalNotifications";

const filterNotifications = (n: Notification[]) => {
    return {
        msgsUw: n
            .filter(notification => "Msg" in notification.kind) 
            .map(notification => ({
                nameSender: "Msg" in notification.kind? notification.kind.Msg.nameSender: "",
                sender: "Msg" in notification.kind?  notification.kind.Msg.sender: Principal.anonymous(),
                chatId: "Msg" in notification.kind?  notification.kind.Msg.chatId: 0,
        })), // Transformamos cada Msg a MsgInterface
        notific: n.filter(notification => !("Msg" in notification.kind)), 
    };
};

interface MsgInterface {
    nameSender: String,
    sender: Principal,
    chatId: number
};

const Header: React.FC = () => {
    const { isAuthenticated, cardDataUser, backend } = useContext(AuthContext);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    // const [msgs, setMsgs] = useState<Notification[]>([]);

    const [msgsUnwraped, setMsgsUnwraped] = useState<MsgInterface[]>([]);

    const [showModalNotifications, setModalShowNotifications] = useState(false);
    const [modalShowMsgs, setModalShowMsgs] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isCardSelected, setIsCardSelected] = useState(false);
    const [selectedCard, setSelectedCard] = useState<CompleteCardData | null>( null );
    // const [selectedNotificationDate, setSelectedNotificationDate] = useState<bigint | null>(null);



    const handleShowNotifications = async () => {
        setModalShowNotifications(true);
    }
    const handleClose = () => { 
        setIsCardSelected(false)
    }
    const handleCloseChat = () => {
        setModalShowMsgs(false)
    }

    const handleShowMsgs = async () => {
        setModalShowMsgs(true);
        
    }

    const closeNotificationsModal = () => {
        setModalShowNotifications(false)
    };

    const removeNotification = (date: bigint) => {
        setNotifications(notifications.filter((n) => n.date !== date)) 
        backend.removeNotification(date);
          
    };

    const handelSelectedNotification = async (principal: Principal, date: bigint) => {
        // setIsLoading(true)
        closeNotificationsModal()
        removeNotification(date)
        
        const response = await backend.getCardByPrincipal(principal);  
        if("Ok" in response){
            setSelectedCard(response.Ok)
            setIsCardSelected(true)
        }
        // setIsLoading(false)   
    }

    useEffect(() => {
        const getNotifications = async () => {
            if (cardDataUser) {
                setIsLoading(true);
                try {
                    let n = await backend.getMyNotifications();
                    // console.log(n)
                    if (n.length > 0) {
                        // let {msg, notific} = filterNotifications(n); // separamos las notificaciones de los mensages
                        let {msgsUw, notific} = filterNotifications(n);
                        // console.log("hola")
                        setNotifications(notific);
                        setMsgsUnwraped(msgsUw)
                        // setMsgs(msg);
                    }
                } catch (error) {
                    console.error("Error al obtener notificaciones:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setNotifications([]);
                setMsgsUnwraped([])
                setIsLoading(false);
            }
        };
        // if (cardDataUser && !(notifications.length > 0)) {
        if (cardDataUser) {
            getNotifications();
        }
        if (!isAuthenticated) {
            setNotifications([]);
            setIsLoading(false);
        }
    }, [backend, cardDataUser, isAuthenticated]);

    return (
        <header className="App-header">

            <div className="md:w-[60px]  flex items-center justify-center mr-[3vw] ">
                {/* <MenuIcon className="h-10 text-gray-400 cursor-pointer" /> */}
                <GeneralMenu />
            </div>

            <div className="w-8 h-8 flex items-center justify-center mr-[.5vw] md:h-8 md:w-8 text-gray-400 cursor-pointer
                transition-transform duration-100 transform hover:scale-110 hover:text-gray-300"
                onClick={() => {
                        if (msgsUnwraped.length > 0) {handleShowMsgs()} 
                      }
                    }
            >
                {cardDataUser?.photo && (msgsUnwraped.length > 0) && <div className="absolute top-30 z-50 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                    style={{ transform: 'translate(50%, -50%)' }}
                >
                    {msgsUnwraped.length}
                </div>}
                <ChatIcon/>
            </div>

            <div translate="no" className="header-title"
            > <img src="" alt="" />
                Smart Network Card</div>

            <div className="relative  flex items-center justify-center mr-[3vw] md:h-8 md:w- h-8 w-8 text-gray-400 cursor-pointer 
                    transition-transform duration-100 transform hover:scale-110 hover:text-gray-300"
                    onClick={() => {
                        if (notifications.length > 0) {handleShowNotifications()} 
                      }
                    }
            >
                {cardDataUser?.photo && (notifications.length > 0) && <div className="absolute top-30 z-50 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                    style={{ transform: 'translate(50%, -50%)' }}
                >
                    {notifications.length}
                </div>}
                <BellIcon/>
            </div>
            <div className="md:w-[100px] h-[70px] flex items-center justify-center ml-[5px]" style={{ minWidth: "50px" }}>
                {isLoading ? (
                    <div className="spinner border-t-2 border-l-2 border-gray-200 w-8 h-8 rounded-full animate-spin"></div>
                ) : !isAuthenticated ? (
                    <LoginButton />
                ) : cardDataUser ?  <UserAvatarMenu />  :  <LogoutButton /> }
            </div>
            {showModalNotifications && <NotificationModal
                notifications={notifications}
                onClose={closeNotificationsModal}
                onSelect={handelSelectedNotification}
            />}

            {isCardSelected && selectedCard &&(<CardDetails {...selectedCard}
                isOpen={isCardSelected}
                onClose={handleClose}
            />)}
            {modalShowMsgs && (<ChatModalNotifications
                msgs={msgsUnwraped.map((msg) => ({
                    nameSender: msg.nameSender,
                    sender: msg.sender,
                    chatId: msg.chatId,
                    })
                )}
                onSelectMessage={(Msg) => {}}
                onClose={handleCloseChat}
                
            />)}

        </header>
    );
};

export default Header;
