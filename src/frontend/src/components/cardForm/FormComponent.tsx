import React, { useState, ChangeEvent, FormEvent, useContext} from 'react';
import {AuthContext} from "../../context/AuthContext"
import { resizeImage } from "../../utils/imageUtils";

type Text = string;
type Nat = bigint;

type FormData = {
    name: Text;
    email: Text;
    phone: Nat;
    photo: Uint8Array | null;
    photoPreview: Uint8Array | null;
    profession: Text;
    skills: Text[];
    links: Text[];
};

interface FormComponentProps {
    onSubmit: () => void;
}

const FormComponent: React.FC<FormComponentProps>  = ({ onSubmit }) => {
    const { backend } = useContext(AuthContext);

    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        phone: BigInt(0),
        photo: null,
        photoPreview: null,
        profession: "",
        skills: [],
        links: []
    });

    const [photoError, setPhotoError] = useState<string | null>(null);

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
                const result = await backend.whoAmI(); // Reemplaza `someFunction` con tu método
                console.log("From FormComponnet: backend.whoAmI():", result);
                let resultCreateCard = await backend.createCard(dataToSend);
                console.log("FormComponnet: ",resultCreateCard);
                // console.log("From FormComponent createCard(): ", resultCreateCard);
                // console.log("From FormComponent createCard(): ", await backend.getMyCard());
            } catch (error) {
                console.error("From FormComponnet: Error al llamar a backend.whoAmI() ", error);
            };
            onSubmit();
        } else {
            console.warn("FormComponent: No hay backend disponible, asegúrate de que el usuario esté autenticado.");
        }
        
    };

    return (
        <form onSubmit={handleFormSubmit} className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-md space-y-4">
            <h2 className="text-2xl font-semibold text-center">Formulario de Usuario</h2>

            <label className="block">
                <span className="text-gray-700">Name:</span>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
            </label>

            <label className="block">
                <span className="text-gray-700">Email:</span>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
            </label>

            <label className="block">
                <span className="text-gray-700">Phone:</span>
                <input
                    type="number"
                    name="phone"
                    value={formData.phone.toString()}
                    onChange={handlePhoneChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
            </label>

            <label className="block">
                <span className="text-gray-700">Photo (max 1.5 MB):</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full"/>
                {photoError && <p className="text-red-500 text-sm mt-1">{photoError}</p>}
            </label>

            <label className="block">
                <span className="text-gray-700">Profession:</span>
                <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
            </label>

            <label className="block">
                <span className="text-gray-700">Skills:</span>
                <textarea
                    name="skills"
                    value={formData.skills.join(", ")}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(", ") })}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
            </label>
            
            <label className="block">
                <span className="text-gray-700">Links:</span>
                <textarea
                    name="links"
                    value={formData.links.join(", ")}
                    onChange={(e) => setFormData({ ...formData, links: e.target.value.split(", ") })}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
            </label>

            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300">
                Submit
            </button>
        </form>
    );
};

export default FormComponent;
