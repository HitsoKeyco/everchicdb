const axios = require('axios');
require('dotenv').config();


const { PORT_BOT_WHATSAPP } = process.env;

const sendMessageWhatsapp = async (phone, message) => {       
    const urlLocal = `${PORT_BOT_WHATSAPP}/v1/send-messages`
    try {
        await axios.post(urlLocal, { phone: String(phone), message });

    } catch (error) {
        console.error('No se ha podido enviar el mensaje por WhatsApp', error, phone, message);
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
            return { message: 'No hay imagen qr' }; // O maneja el error según tu lógica
        }
    } catch (error) {
        console.error('No se pudo extraer el QR', error);
        return { message: 'No se pudo extraer el QR', error }; // O maneja el error según tu lógica
    }
}

const closeConectionWhatsapp = async () => {
    console.log('llege a la funcion q llama a servicio de menssaje');
    
    const urlLocal = 'http://localhost:3010/v1/close-session';
    const response = await axios.get(urlLocal)
    if (response && response.data) {
        console.log('Conexión cerrada con éxito', response.data);
    } else {
        console.error('No se pudo cerrar la conexión', response.data);
    }

}





module.exports = {
    sendMessageWhatsapp,
    getQrWhatsapp,
    closeConectionWhatsapp
}
