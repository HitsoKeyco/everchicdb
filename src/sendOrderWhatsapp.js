const axios = require('axios');

const sendMessageWhatsapp = async (phone, message) => {
    const urlLocal = 'http://localhost:3010/v1/send-messages';
    try {
        await axios.post(urlLocal, { phone: String(phone), message });       
        
    } catch (error) {
        console.error('No se ha podido enviar el mensaje por WhatsApp',error, phone, message);
    }
}

const getQrWhatsapp = async () => {
    const urlLocal = 'http://localhost:3010';
    try {
        const response = await axios.get(urlLocal, {
            responseType: 'arraybuffer' // Indica que la respuesta es un ArrayBuffer
        });

        // Verificar si la respuesta tiene datos
        if (response && response.data) {
            // Convertir el ArrayBuffer a base64 para mostrar la imagen
            const imageBase64 = `data:image/png;base64,${Buffer.from(response.data, 'binary').toString('base64')}`;
            return imageBase64; // Devuelve la imagen en formato base64
        } else {
            console.error('La respuesta no tiene datos');
            return null; // O maneja el error según tu lógica
        }
    } catch (error) {
        console.error('No se pudo extraer el QR', error);
        return null; // O maneja el error según tu lógica
    }
}


module.exports = {
    sendMessageWhatsapp,
    getQrWhatsapp
}
