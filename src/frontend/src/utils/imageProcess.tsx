

export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
}

export function base64ToBlob(dataUrl: string) {
    var base64Content = dataUrl.split(',')[1]; 
    var byteCharacters = atob(base64Content);
    var byteArray = new Uint8Array(byteCharacters.length);
    for (var i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
    }
    return byteArray;
};