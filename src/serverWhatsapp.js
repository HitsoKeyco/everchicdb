const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const socketIo = require('socket.io');

const app = express();
const PORT = process.env.PORT_CHAT_WHATSAPP;
let isClientReady;
let client

// Inicialización del servidor Express y Socket.IO
const server = app.listen(PORT, () => {
    console.log(`Server Socket.IO ${PORT}`);
});

const io = socketIo(server, {
    cors: {
        origin: ['www.everchic.ec', 'http://localhost:5000', 'http://localhost:3000'],//www.everchic.ec
        methods: ['GET', 'POST']
    }
});


// Función para inicializar el cliente de WhatsApp
const initializeWhatsAppClient = () => {
    return new Promise((resolve, reject) => {
        client = new Client({
            authStrategy: new LocalAuth({
                dataPath: "sessions",
            }),
            webVersionCache: {
                type: 'remote',
                remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2413.51-beta.html',
            },
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            }
        });

        // Evento para escuchar cuando el cliente esté listo
        client.on('ready', async () => {
            console.log('Cliente de WhatsApp listo!');
            const stateConectionLog = true
            io.emit('session_log', stateConectionLog);
            isClientReady = true;
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
            isClientReady = false;
            console.error('Error de autenticación:', err);
            reject(err);
        });

        // Evento para manejar desconexion
        client.on('disconnected', (reason) => {
            isClientReady = false;
            const stateConectionLogOut = true
            io.emit('session_logout', stateConectionLogOut);            
            console.log('Client was logged out', reason);
            
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

//funcion para validar el estadi de cliente log o logout
const validateClientStatus = async () => {
    if (isClientReady) {
        return true;
    } else {
        return false;
    }
}

const statusConecction = async () => {
    return isClientReady;
}

// Función para destruir la sesión del cliente
const destroySession = async () => {
    try {
        if (isClientReady) {
            await client.logout();
            isClientReady = false;
            console.log('Client session destroyed successfully');
        } else {
            console.log('Client is not ready or not initialized');
        }
    } catch (error) {
        console.error('Error al destruir la sesión:', error);
    }
};


module.exports = { initializeWhatsAppClient, sendMessage, validateClientStatus, destroySession, statusConecction };
