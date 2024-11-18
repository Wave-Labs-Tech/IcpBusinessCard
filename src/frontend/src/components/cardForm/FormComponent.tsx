import React, { useState, ChangeEvent, FormEvent, useContext } from 'react';
import 'react-phone-input-2/lib/style.css';
import { AuthContext } from "../../context/AuthContext"
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

const FormComponent: React.FC<FormComponentProps> = ({ onSubmit }) => {
    const { backend, updateCardDataUser } = useContext(AuthContext);

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
                    let resizeFile = await resizeImage(file, 50);
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
                if("Ok" in resultCreateCard){
                   updateCardDataUser(resultCreateCard.Ok) 
                }
                
                console.log("FormComponnet: ", resultCreateCard);
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

    const handleLinkSocialChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Separar valores de Links y Social Networks
        const linksArray = name === "links" ? value.split(",").map((link) => `Link: ${link.trim()}`) :
            formData.links.filter(link => link.startsWith("Link:"));

        const socialArray = name === "social" ? value.split(",").map((social) => `Social: ${social.trim()}`) :
            formData.links.filter(link => link.startsWith("Social:"));

        // Actualizar formData con ambos arrays combinados
        setFormData((prevData) => ({
            ...prevData,
            links: [...linksArray, ...socialArray],
        }));
    };

    return (
        <form onSubmit={handleFormSubmit} className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-md space-y-1 modal">
            <h2 className="text-xl sm:text-2xl text-gray-200 font-semibold text-center">Crear Business Card</h2>

            <label className="block text-left">
                <span className="text-gray-200 text-[12px]">Name:</span>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full p-2 border border-gray-300 rounded-md"
                    required
                />
            </label>

            <label className="block text-left">
                <span className="text-gray-200 text-[12px]">Profession:</span>
                <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleInputChange}
                    className="block w-full p-2 border border-gray-300 rounded-md"
                    required
                />
            </label>

            <label className="block text-left">
                <span className="text-gray-200 text-[12px]">Descripción del servicio:</span>
                <textarea
                    name="skills"
                    // value={formData.skills.join(", ")}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(", ") })}
                    className="block w-full p-2 border border-gray-300 rounded-md"
                />
            </label>

            <label className="block text-left">
                <span className="text-gray-200 text-[12px]">Links:</span>
                <textarea
                    name="links"
                    value={formData.links
                        .filter((link) => link.startsWith("Link:"))
                        .map((link) => link.replace("Link: ", ""))
                        .join(", ")}
                    onChange={handleLinkSocialChange}
                    className="block w-full p-2 border border-gray-300 rounded-md"
                />
            </label>

            <label className="block text-left">
                <span className="text-gray-200 text-[12px]">Social Networks:</span>
                <textarea
                    name="social"
                    value={formData.links
                        .filter((link) => link.startsWith("Social:"))
                        .map((link) => link.replace("Social: ", ""))
                        .join(", ")}
                    onChange={handleLinkSocialChange}
                    placeholder='www.linkedin.com/in/bob-marley'
                    className="block w-full p-2 border border-gray-300 rounded-md"
                />
            </label>

            <label className="block text-left">
                <span className="text-gray-200 text-[12px]">Email:</span>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full p-2 border border-gray-300 rounded-md"
                    required
                />
            </label>

            <label className="block text-left">
                <span className="text-gray-200 text-[12px]">Phone: (Optional)</span>
                <span className="phone w-[50px] text-black font-semibold bg-white block w-full p-2 border border-gray-300 rounded-md flex items-center">
                    <span className='flex items-center justify-center'> + </span>
                    <input
                        type="phone"
                        name="phone"
                        value={formData.phone.toString()}
                        onChange={handlePhoneChange}
                        className="font-normal ml-2 bg-[#2e2d2dad]"
                    />
                </span>
            </label>

            <label className="block text-left ">
                <span className="text-gray-200 text-[12px]">Photo (max 1.5 MB):</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className=" block w-full  text-[15px] " />
                {photoError && <p className="text-red-500 text-sm">{photoError}</p>}
            </label>

            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300">
                Submit
            </button>
        </form>
    );
};

export default FormComponent;
