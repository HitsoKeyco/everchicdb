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
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api/v1', router);

app.get('/', (req, res) => {
    return res.send("Welcome to express!");
})


//----------------server whatsapp---------------------
initializeWhatsAppClient()
    .then(() => {        
        sendMessage();
        console.log('Se envio el mensaje');
    })
    .catch(err => {
        console.error('Error al inicializar el cliente de WhatsApp:', err);
    });


//middlewares después de las rutas
app.use(errorHandler)

module.exports = { app };





