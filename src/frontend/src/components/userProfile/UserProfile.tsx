import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
// import { backend } from '../../declarations/backend';
import {CompleteCardData} from "../../declarations/backend/backend.did";
import CreateCard from "../cardForm/CreateCard";
import CardPreview from '../CardDetails';
import { pathToFileURL } from 'url';

// const defaultCardData = {
//   owner: "N/A",
//   name: "No Name",
//   photoPreview: new Uint8Array(),  // Aquí se usa un arreglo vacío para `Uint8Array`
//   profession: "Unspecified",
//   skils: ["Skill1", "Skill2", "Skill3"],
//   positions: [],
//   certificates: []
// };

export function UserProfile() {
  const { isAuthenticated, identity, backend } = useContext(AuthContext);  // Accede a la autenticación
  const [cardData, setCardData] = useState<CompleteCardData | null>(null);  // Estado para los datos de la tarjeta
  const [loading, setLoading] = useState(true);  // Estado para controlar el spinner de carga
  const [formSuccess, setFormSuccess] = useState(false);
  const [compressedPreviewUrl, setCompressedPreviewUrl] = useState<any | null>(null); // URL de la vista previa de la foto comprimida

  useEffect(() => {
    const fetchCardData = async () => {
      if (isAuthenticated && backend) {
        try {
          const response = await backend.getMyCard();
          
          if ('Ok' in response) {
            console.log("From UserProfile backend.getMyCard() ", response.Ok);
            // console.log("response. ok ", response?.phone);
            console.log("PHOTO ", response.Ok.photo);
            const blob = new Blob([new Uint8Array(response.Ok.photo)], { type: "image/jpeg" });
            const url = URL.createObjectURL(blob);
            setCompressedPreviewUrl(url);
            setCardData(response.Ok);  // Si es Ok, actualizamos cardData con los datos de la tarjeta
          } else {      
            setError("Card not found");
          }
        } catch (err) {
          setCardData(null)
          console.error("Error fetching card data:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    // let thumnailPhoto = new Uint8Array(await resizeFile.arrayBuffer());
    // setCompressedPreviewUrl(URL.createObjectURL(new Blob([thumnailPhoto], {type: 'image/jpeg'})));
    // console.log("IAMGE", (URL.createObjectURL(new Blob([thumnailPhoto], {type: 'image/jpeg'}))))
    // console.log("Thumnail", thumnailPhoto);

    fetchCardData();
  }, [isAuthenticated, identity, backend, formSuccess]);

  const handleFormSuccess = () => {
    setFormSuccess(true);
    setIsFormModalOpen(false);
  };

  const openFormModal = () => setIsFormModalOpen(true);
  const closeFormModal = () => setIsFormModalOpen(false);

  if (loading) {
    return <div>Loading...</div>;
  }
// return(
//   <div>
//       {/* <CardPreview card={cardData.card || defaultCardData} /> */}
//   </div>

// )

return (
<div className="bg-gray-800 shadow-lg rounded-lg p-4 m-2 flex flex-col items-center w-60 h-80 border border-gray-700 hover:border-green-500 transition-colors duration-300"> 
  <img src={compressedPreviewUrl} alt={`${cardData?.name} preview`} className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-green-500 shadow-md" />
   {/* <div className="w-24 h-24 bg-gray-700 rounded-full mb-4 border-2 border-gray-600" /> */}
  <h3 className="text-lg font-semibold text-green-300">{cardData?.name}</h3>
  <p className="text-sm text-gray-400">{cardData?.profession}</p>
  <div className="mt-2">
      <h4 className="text-xs font-semibold text-green-400">Skills:</h4>
      <ul className="text-xs text-gray-300 list-disc list-inside">
          {cardData?.skils.slice(0, 3).map((skill, index) => (
              <li key={index}>{skill}</li>
          ))}
      </ul>
  </div>
</div>
)
//   return (
//     <div>
//       {isAuthenticated && (
//         <div>
//           {cardData ? (
//             <div>
//               <h1>My Card</h1>
//               <p>Name: {cardData.name}</p>
//               <p>Email: {cardData.email}</p>
//               {/* <p>Contacts: {cardData.contactQty}</p> */}
//             </div>
//           ) : (
//             <div className='w-full'>
//               <CreateCard onFormSubmit={handleFormSuccess} />
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
}

