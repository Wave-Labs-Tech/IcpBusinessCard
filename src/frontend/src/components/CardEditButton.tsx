import React, {useContext} from 'react';
import { AuthContext } from '../context/AuthContext';
import  CardEditForm from "./CardEditForm"
// import { CloseButton } from 'react-toastify';
// import { FormModal } from "../components/cardForm/FormModal";



const handleShareCard = () => {

    console.log("Boton apretado")
}

const CardEditButton: React.FC = () => {
    const { backend, cardDataUser } = useContext(AuthContext);
    return (
        <>
        {cardDataUser && (
            <button className='bg-green-500 text-gray-800 rounded-lg pl-1 pr-1'
            style={{
                alignSelf: "end",
                marginBottom: "10px",
                position: "relative",
                minWidth: "100px",
                top: "10px",
                right: "10px"
            }}
            onClick={handleShareCard}
            >
                Edit
            </button>)
            }
        </>
    )
};

export default CardEditButton;