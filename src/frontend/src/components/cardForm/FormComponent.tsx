import React, { useState, ChangeEvent, FormEvent, useContext } from 'react';
import 'react-phone-input-2/lib/style.css';
import { AuthContext } from "../../context/AuthContext"
import { resizeImage } from "../../utils/imageUtils";
import { CardDataInit } from '../../declarations/backend/backend.did';

interface FormComponentProps {
    onSubmit: () => void;
}

const FormComponent: React.FC<FormComponentProps> = ({ onSubmit }) => {
    const { backend, updateCardDataUser } = useContext(AuthContext);

    const [formData, setFormData] = useState<CardDataInit>({
        name: "",
        email: "",
        phone: BigInt(0),
        photo: [],
        photoPreview: [],
        profession: "",
        keyWords: [],
        links: []
    });

    const [photoError, setPhotoError] = useState<string | null>(null);
    const [compressedPreviewUrl, setCompressedPreviewUrl] = useState<any | null>(null); // URL de la vista previa de la foto comprimida

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            if (file.size > 1.5 * 1024 * 1024) {
                setPhotoError("El tamaño de la foto no debe superar los 1.5 MB"); // Se puede redimensionar directamente
            } else {
                try {
                    const photo = new Uint8Array(await file.arrayBuffer());
                    let resizeFile = await resizeImage(file, 120);
                    let thumnailPhoto = new Uint8Array(await resizeFile.arrayBuffer());
                    setCompressedPreviewUrl(URL.createObjectURL(new Blob([thumnailPhoto], {type: 'image/jpeg'})));
                    console.log("IAMGE", (URL.createObjectURL(new Blob([thumnailPhoto], {type: 'image/jpeg'}))))
                    console.log("Thumnail", thumnailPhoto);
                    setFormData({
                        ...formData,
                        photo: photo,
                        photoPreview: thumnailPhoto,
                    });
                    setPhotoError(null);
                } catch (error) {
                    console.error("Error al procesar el archivo:", error);
                    setPhotoError("Error al procesar el archivo.");
                }
            }
        }
    };

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const phoneValue = e.target.value;
        setFormData({ ...formData, phone: BigInt(phoneValue) });
    };

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const validPhoto = formData.photo || new Uint8Array();
        const validPhotoPreview = formData.photoPreview || new Uint8Array();
        const dataToSend = {
            ...formData,
            photo: validPhoto,
            photoPreview: validPhotoPreview
        };
        if (backend) {
            try {
                let resultCreateCard = await backend.createCard(dataToSend);
                if("Ok" in resultCreateCard){
                   updateCardDataUser(resultCreateCard.Ok) 
                }

            } catch (error) {
                console.error("From FormComponnet: Error al llamar a backend.whoAmI() ", error);
            };
            onSubmit();
        } else {
            console.warn("FormComponent: No hay backend disponible, asegúrate de que el usuario esté autenticado.");
        }

    };

    // return (
    //     <form onSubmit={handleFormSubmit} className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-md space-y-4">
    //         <h2 className="text-2xl font-semibold text-center">Formulario de Usuario</h2>

    //         <label className="block">
    //             <span className="text-gray-700">Name:</span>
    //             <input
    //                 type="text"
    //                 name="name"
    //                 value={formData.name}
    //                 onChange={handleInputChange}
    //                 className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
    //             />
    //         </label>

    //         <label className="block">
    //             <span className="text-gray-700">Email:</span>
    //             <input
    //                 type="email"
    //                 name="email"
    //                 value={formData.email}
    //                 onChange={handleInputChange}
    //                 className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
    //             />
    //         </label>

    //         <label className="block">
    //             <span className="text-gray-700">Phone:</span>
    //             <input
    //                 type="number"
    //                 name="phone"
    //                 value={formData.phone.toString()}
    //                 onChange={handlePhoneChange}
    //                 className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
    //             />
    //         </label>

    //         <label className="block">
    //             <span className="text-gray-700">Photo (max 1.5 MB):</span>
    //             <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full"/>
    //             {photoError && <p className="text-red-500 text-sm mt-1">{photoError}</p>}
    //         </label>

    //         <label className="block">
    //             <span className="text-gray-700">Profession:</span>
    //             <input
    //                 type="text"
    //                 name="profession"
    //                 value={formData.profession}
    //                 onChange={handleInputChange}
    //                 className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
    //             />
    //         </label>

    //         <label className="block">
    //             <span className="text-gray-700">Skills:</span>
    //             <textarea
    //                 name="skills"
    //                 value={formData.skils.join(", ")}
    //                 onChange={(e) => setFormData({ ...formData, skils: e.target.value.split(", ") })}
    //                 className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
    //             />
    //         </label>
            
    //         <label className="block">
    //             <span className="text-gray-700">Links:</span>
    //             <textarea
    //                 name="links"
    //                 value={formData.links.join(", ")}
    //                 onChange={(e) => setFormData({ ...formData, links: e.target.value.split(", ") })}
    //                 className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
    //             />
    //         </label>

    //         <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300">
    //             Submit
    //         </button>
    //     </form>
    // );
    console.log("Comp. photo: ", compressedPreviewUrl);
    return (
        <div className="w-full max-w-2xl flex m-auto mb-12 text-green-800">
    <form className="w-full max-w-full bg-white shadow-md rounded px-20 py-4" onSubmit={handleFormSubmit}>
        {/* Campo name */}
        <div className="mb-4 w-full">
        <label className="block text-sm font-bold mb-2">
            Name:
            <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 text-lg leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
            />
        </label>
        </div>
        <div className="mb-4">
        {/* Campo profession */}
        <label className="block text-sm font-bold mb-2">
            Profession:
            <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 text-lg leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleInputChange}
            />
        </label>
        </div>
        {/* Campo skills */}
        <div className="mb-4">
        <label className="block text-sm font-bold mb-2">
            Skills:
            <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 text-lg leading-tight focus:outline-none focus:shadow-outline"
                name="skills"
                value={formData.skils.join(", ")}
                onChange={(e) => setFormData({ ...formData, skils: e.target.value.split(", ") })}
                />
        </label>
                </div>
        {/* Campo email */}
        <div className="mb-4">
        <label className="block text-sm font-bold mb-2">
            Email:
            <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 text-lg leading-tight focus:outline-none focus:shadow-outline"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
            />
        </label>
                </div>

        {/* Campo phone */}
        <div className="mb-4">
        <label className="block text-sm font-bold mb-2">
            Phone:
            <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 text-lg leading-tight focus:outline-none focus:shadow-outline"
                type='phone'
                name="phone"
                value={formData.phone.toString()}
                onChange={handlePhoneChange}
            />
        </label>
        </div>
        {/* Campo links */}
            <div className="mb-4">
        <label className="block text-sm font-bold mb-2">
            Links:
            <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 text-lg leading-tight focus:outline-none focus:shadow-outline"
                name="links"
                value={formData.links.join(", ")}
                onChange={(e) => setFormData({ ...formData, links: e.target.value.split(", ") })}
            />
        </label>
        </div>

        {/* Campo photo */}
        <div className="mb-4 text-green-800">
        <label className="block text-sm font-bold mb-2">
            Photo (max 1.5 MB):
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 text-lg leading-tight focus:outline-none focus:shadow-outline" 
            type="file" accept="image/*" onChange={handleFileChange} />
            {photoError && <p style={{ color: "red" }}>{photoError}</p>}
        </label>
        <div className="flex flex-col items-center text-center mt-4">
                {compressedPreviewUrl && (
                    <>
                        <h3>Vista previa de la imagen comprimida</h3>
                        <img src={compressedPreviewUrl} alt="Vista previa comprimida" className="w-3/4 rounded-md mt-4"/>
                    </>
                )}   
            </div>
        </div>
        <button className="font-bold mt-10 w-4/5 bg-green-300 text-green-800 rounded p-2 shadow-lg hover:scale-105" type="submit">Create card</button>
    </form>
    </div>
);
};

export default FormComponent;
