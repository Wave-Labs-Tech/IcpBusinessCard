import React, { useState, ChangeEvent, FormEvent, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
// import { backend } from '../../declarations/backend';
import { resizeImage } from '../../utils/imageUtils'; // Importamos la función desde utils

// Definimos los tipos
type Text = string;
type Nat = bigint;

type FormData = {
    name: Text;
    email: Text;
    phone: Nat;
    photo: Uint8Array | null; // La foto puede ser null al principio
    photoPreview: Uint8Array | null;
    profession: Text;
    skils: Text[];
    links: Text[];
};

const FormComponent: React.FC = () => {

    const { backendActor } = useContext(AuthContext);

    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        phone: BigInt(0),
        photo: null,
        photoPreview: null,
        profession: "",
        skils: [],
        links: []
    });

    const [photoError, setPhotoError] = useState<string | null>(null); 

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Manejador de cambio de archivo (foto)
    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;

        if (file) {
            if (file.size > 1.5 * 1024 * 1024) { // Limitar tamaño a 1.5MB
                setPhotoError("El tamaño de la foto no debe superar los 1.5 MB");
            } else {
                try {
                    // Convertimos el archivo original a Uint8Array
                    const arrayBuffer = await file.arrayBuffer();
                    const uint8Array = new Uint8Array(arrayBuffer);

                    // Redimensionar la imagen para que tenga un tamaño máximo de 100 KB
                    const resizedPhoto = await resizeImage(file, 100); // Usamos la función importada
                    const resizedArrayBuffer = await resizedPhoto.arrayBuffer();
                    const resizedUint8Array = new Uint8Array(resizedArrayBuffer);

                    console.log("Original photo bytes:", uint8Array.length);
                    console.log("Resized photo bytes:", resizedUint8Array.length);

                    // Guardamos ambas versiones en el estado
                    setFormData({
                        ...formData,
                        photo: uint8Array,
                        photoPreview: resizedUint8Array, // Almacenamos la foto reducida en photoPreview
                    });
                    setPhotoError(null); // Reseteamos el error si es válido
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
        if (!backendActor) {
            console.error("El actor del backend no está disponible.");
            return;
        }

        const validPhoto = formData.photo ? formData.photo : new Uint8Array();
        const validPhotoPreview = formData.photoPreview ? formData.photoPreview : new Uint8Array();

        const dataToSend = { 
            ...formData, 
            photo: validPhoto,
            photoPreview: validPhotoPreview
        };

        await backendActor.createCard(dataToSend);
        console.log(dataToSend);
    };

    return (
        <form onSubmit={handleFormSubmit}>
            {/* Campo name */}
            <label>
                Name:
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                />
            </label>

            {/* Campo email */}
            <label>
                Email:
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                />
            </label>

            {/* Campo phone */}
            <label>
                Phone:
                <input
                    type="number"
                    name="phone"
                    value={formData.phone.toString()}
                    onChange={handlePhoneChange}
                />
            </label>

            {/* Campo photo */}
            <label>
                Photo (max 1.5 MB):
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {photoError && <p style={{ color: "red" }}>{photoError}</p>}
            </label>

            {/* Campo profession */}
            <label>
                Profession:
                <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleInputChange}
                />
            </label>

            {/* Campo skills */}
            <label>
                Skills:
                <textarea
                    name="skills"
                    value={formData.skils.join(", ")}
                    onChange={(e) => setFormData({ ...formData, skils: e.target.value.split(", ") })}
                />
            </label>
            
            {/* Campo links */}
            <label>
                Links:
                <textarea
                    name="links"
                    value={formData.links.join(", ")}
                    onChange={(e) => setFormData({ ...formData, links: e.target.value.split(", ") })}
                />
            </label>

            <button type="submit">Submit</button>
        </form>
    );
};

export default FormComponent;
