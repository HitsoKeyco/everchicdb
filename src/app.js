
const fs = require('fs')
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const router = require('./routes');
const errorHandler = require('./utils/errorHandler');
require('dotenv').config();
const path = require("path");
const { initializeWhatsAppClient, sendMessage } = require('./serverWhatsapp');

// Esta es nuestra aplicación
const app = express();

// Middlewares
app.use(express.json());
app.use(helmet({
    crossOriginResourcePolicy: false,
}));


// Configuración de CORS
// app.use(cors({
//     origin: ['https://www.everchic.ec/api/v1', 'http://localhost:3000'], // Permite solicitudes solo desde este dominio
//     methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
//     allowedHeaders: ['Content-Type', 'Authorization'], // Cabeceras permitidas
//     credentials: true // Permite enviar cookies de autenticación
// }));

app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', router);

app.get('/', (req, res) => {
    return res.send("Welcome to express!");
});

//----------------server whatsapp---------------------
//initializeWhatsAppClient()
//    .then(() => {
//        sendMessage();
//        console.log('Se envió el mensaje');
//    })
//    .catch(err => {
//        console.error('Error al inicializar el cliente de WhatsApp:', err);
//    });

// Middlewares después de las rutas
app.use(errorHandler);

module.exports = { app };
