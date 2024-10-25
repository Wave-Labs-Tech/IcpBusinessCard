// imageUtils.ts
export const resizeImage = (file: File, maxFileSizeKB: number): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Definir nuevas dimensiones manteniendo la relación de aspecto
                let width = img.width;
                let height = img.height;
                const maxFileSizeBytes = maxFileSizeKB * 1024;

                // Ajustar el tamaño de la imagen para que no sobrepase el tamaño en KB
                let scaleFactor = Math.sqrt(maxFileSizeBytes / file.size); // Relación entre tamaño actual y deseado
                canvas.width = width * scaleFactor;
                canvas.height = height * scaleFactor;

                // Dibujamos la imagen redimensionada en el canvas
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Convertimos el canvas a Blob para reducir el tamaño
                canvas.toBlob((blob) => {
                    if (blob) {
                        // Asegurarnos de que el tamaño es adecuado
                        if (blob.size <= maxFileSizeBytes) {
                            const resizedFile = new File([blob], file.name, { type: file.type });
                            resolve(resizedFile);
                        } else {
                            reject(new Error("No se pudo reducir la imagen al tamaño deseado."));
                        }
                    }
                }, file.type, 0.7); // Ajustamos la calidad de la imagen (0.7 para reducir aún más)
            };
        };

        reader.readAsDataURL(file);
    });
};
