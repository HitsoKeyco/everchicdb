const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const socketIo = require('socket.io');

const app = express();
const PORT = process.env.PORT_CHAT_WHATSAPP;

let client;

// Inicialización del servidor Express y Socket.IO
const server = app.listen(PORT, () => {
    console.log(`Server Whatsapp ${PORT}`);
});

const io = socketIo(server, {
    cors: {
        origin: ['https://www.everchic.ec/admin/'],
        methods: ['GET', 'POST']
    }
});

// Función para inicializar el cliente de WhatsApp
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
        client.on('ready', async () => {
            console.log('Cliente de WhatsApp listo!');
            resolve();
        });

        // Evento para escuchar cuando se genera un nuevo código QR
        client.on('qr', async qr => {
            try {
                const qrDataURL = await qrcode.toDataURL(qr, { errorCorrectionLevel: 'H' });
                io.emit('qrCode', qrDataURL);
            } catch (error) {
                console.error('Error al generar el código QR:', error);
            }
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
    try {
        if (phone && message) {
            await client.sendMessage(phone, message);
            console.log('Mensaje enviado con éxito');
        } else {
            console.error('El número de teléfono o el mensaje están vacíos');
        }
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
    }
};

module.exports = { initializeWhatsAppClient, sendMessage };
