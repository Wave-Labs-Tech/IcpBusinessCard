import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import CardEditForm from "./CardEditForm"
import { UpdatableData } from '../declarations/backend/backend.did';


const CardEditButton: React.FC = () => {

    const handleOnSubmit = (data: UpdatableData) => {
        console.log(data)
    }
    
    const handelOnClose = () => {
        setShowEditForm(false)
    }

    const { cardDataUser } = useContext(AuthContext);
    const [showEditForm, setShowEditForm] = useState(false);

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
                        right: "10px",
                        padding: "4px 0px 4px 0px"
                    }}
                    onClick={() => setShowEditForm(true)}
                >
                    Edit
                </button>)
            }
            {showEditForm && <CardEditForm
                onSubmit={handleOnSubmit}
                onClose={handelOnClose}
            >
            
            </CardEditForm>}
        </>
    )
};

export default CardEditButton;