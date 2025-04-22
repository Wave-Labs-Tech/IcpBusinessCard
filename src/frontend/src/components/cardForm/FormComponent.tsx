import React, { useState, ChangeEvent, FormEvent, useContext, useRef } from 'react';
import 'react-phone-input-2/lib/style.css';
import { AuthContext } from "../../context/AuthContext"
import { resizeImage } from "../../utils/imageUtils";
import { CardDataInit } from '../../declarations/backend/backend.did';
import { UserIcon } from '@heroicons/react/outline';
import PhonePrefixSelector from '../PhonePrefixSelector';

interface FormComponentProps {
    onSubmit: () => void;
    onClose: () => void
}

const FormComponent: React.FC<FormComponentProps> = ({ onSubmit, onClose }) => {
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
    const [photo, setPhoto] = useState<React.ReactNode>(<UserIcon className="w-[90px] h-[90px] sm:w-[140px] sm:h-[140px] rounded-full" />);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [countryCode, setCountryCode] = useState<string>("1");
    const [phone, setPhone] = useState<string>("");

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            let resizeFile = await resizeImage(file, 512);
            let resizeThumbnail = await resizeImage(file, 25);
            const photo = new Uint8Array(await resizeFile.arrayBuffer());
            let thumnailPhoto = new Uint8Array(await resizeThumbnail.arrayBuffer());
            setFormData({
                ...formData,
                photo: photo,
                photoPreview: thumnailPhoto,
            });
            setPhoto(<img src={URL.createObjectURL(file)} alt="Uploaded" className="object-cover w-full h-full" />);
            setPhotoError(null);
        }
    };

    const handleCountrySelect = (value: string) => {
        console.log(value)
        setCountryCode(value);
    }

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const phoneValue = e.target.value;
        if (/^\d*$/.test(phoneValue)) {
            setPhone(phoneValue);
            setFormData({ ...formData, phone :BigInt(countryCode + phoneValue)});
        }
        console.log(countryCode + phoneValue)
    };

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const validPhoto = formData.photo || new Uint8Array();
        const validPhotoPreview = formData.photoPreview || new Uint8Array();
        console.log(Math.log10(Number(formData.phone)) > 8)
        const dataToSend = {
            ...formData,
            phone: Math.log10(Number(formData.phone)) > 8? formData.phone : BigInt(0),
            photo: validPhoto,
            photoPreview: validPhotoPreview
        };
        if (backend) {
            try {
                let resultCreateCard = await backend.createCard(dataToSend);
                if ("Ok" in resultCreateCard) {
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
        <form onSubmit={handleFormSubmit} className="w-[100vw] h-[100vh] p-6 bg-white shadow-md rounded-md space-y-1 modal overflow-y-auto custom-scrollbar">
            <div className='flex flex-row justify-between items-center'>
                <h2 className="text-xl sm:text-2xl text-gray-200 font-semibold">Crear Business Card</h2>
                <div className='h-8 w-8 rounded-full bg-[#334455] text-center justify-center flex items-center cursor-pointer' onClick={() => { }}>
                    <button 
                        className="text-gray-400 hover:text-white text-xl font-bold"
                        onClick={onClose}
                    >
                        X</button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Foto */}
                <div
                    className="relative w-[90px] h-[90px] sm:w-[140px] sm:h-[140px] cursor-pointer rounded-full border-2 border-gray-400 bg-gray-600 flex items-center justify-center flex-shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <div className="absolute inset-0 z-0 rounded-full overflow-hidden">
                        {photo}
                    </div>
                </div>

                {/* Name + Phone */}
                <div className="flex flex-col flex-grow gap-2">
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

                    <div className="flex flex-col gap-2">
                        <label className="block text-left">
                            <span className="text-gray-200 text-[12px]">Phone: (Optional)</span>
                            <div className="phone w-[50px] text-black font-semibold bg-white block w-full  border border-gray-300 rounded-md flex items-center">
                                <PhonePrefixSelector handleChange={handleCountrySelect} />
                                <input
                                    type="phone"
                                    name="phone"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    className="font-normal ml-2 bg-transparent outline-none"
                                    placeholder="Phone number"
                                />
                            </div>
                        </label>
                        </div>

                    {/* <label className="block text-left">
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
                    </label>  */}

                    {/* <label className="block text-left">
                        <span className="text-gray-200 text-[12px]">Phone: (Optional)</span>
                        <span className="flex items-center w-full p-2 border border-gray-300 rounded-md bg-white text-black font-semibold">
                            <span className='flex items-center justify-center'>+</span>
                            <input
                                type="phone"
                                name="phone"
                                value={formData.phone.toString()}
                                onChange={handlePhoneChange}
                                className="ml-2 flex-grow bg-[#2e2d2dad] font-normal"
                            />
                        </span>
                    </label> */}
                </div>
            </div>

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
                    name="keyWords"
                    onChange={(e) => setFormData({ ...formData, keyWords: e.target.value.split(",").map(k => k.trim()) })}
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

            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300">
                Submit
            </button>
        </form>
    );
};

export default FormComponent;
