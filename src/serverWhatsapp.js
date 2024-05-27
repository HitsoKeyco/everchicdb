// whatsapp.js

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let client;

// Función para inicializar el cliente de WhatsApp
const initializeWhatsAppClient = () => {
    return new Promise((resolve, reject) => {
        client = new Client({
            authStrategy: new LocalAuth({
                dataPath: "sessions",
            }),
            webVersionCache: {
                type: 'remote',
                remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
            }
        });

        // Evento para escuchar cuando el cliente esté listo
        client.on('ready', () => {
            console.log('Cliente de WhatsApp listo!');
            resolve();
        });

        // Evento para mostrar el código QR
        client.on('qr', qr => {
            qrcode.generate(qr, { small: true });
        });

        // Evento para manejar errores
        client.on('auth_failure', err => {
            console.error('Error de autenticación:', err);
            reject(err);
        });

        // Inicializar el cliente
        client.initialize();
    });
};

// Función para enviar un mensaje
const sendMessage = async (phone, message) => {
    console.log(phone,message);
    try {
        if(phone, message){
            await client.sendMessage(phone, message);
            console.log('Mensaje enviado con éxito');
        }
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
    }
};

module.exports = { initializeWhatsAppClient, sendMessage };
