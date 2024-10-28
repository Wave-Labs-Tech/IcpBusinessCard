export const resizeImage = (file: File, maxFileSizeKB: number): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Definir el tamaño deseado
                let width = img.width;
                let height = img.height;
                const maxFileSizeBytes = maxFileSizeKB * 1024;
                let quality = 0.7; // Calidad inicial

                const resizeAndCompress = () => {
                    // Calcular escala necesaria
                    const scaleFactor = Math.sqrt(maxFileSizeBytes / file.size);
                    canvas.width = width * scaleFactor;
                    canvas.height = height * scaleFactor;
                    ctx?.clearRect(0, 0, canvas.width, canvas.height);

                    // Dibujar la imagen redimensionada
                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Convertir a Blob con el tipo adecuado
                    canvas.toBlob((blob) => {
                        if (blob) {
                            // Si el tamaño es adecuado, devolver el archivo redimensionado
                            if (blob.size <= maxFileSizeBytes) {
                                const resizedFile = new File([blob], file.name, { type: file.type });
                                resolve(resizedFile);
                            } else if (quality > 0.1) { // Reducir la calidad y volver a intentar
                                quality -= 0.1;
                                resizeAndCompress();
                            } else {
                                reject(new Error("No se pudo reducir la imagen al tamaño deseado."));
                            }
                        }
                    }, file.type === "image/png" ? "image/jpeg" : file.type, quality); // Convertir a JPEG si es PNG
                };

                resizeAndCompress();
            };
        };

        reader.readAsDataURL(file);
    });
};
