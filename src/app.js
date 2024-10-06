
const fs = require('fs')
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const router = require('./routes');
const errorHandler = require('./utils/errorHandler');
require('dotenv').config();
const path = require("path");
const rateLimit = require('express-rate-limit')


// Esta es nuestra aplicación
const app = express();

// Middlewares
app.use(express.json());
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

//Limitar conexiones por ip
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 2000, // Limitar a 10 solicitudes por IP
    message: 'Demasiadas solicitudes desde esta dirección IP, por favor intenta de nuevo más tarde.'
});

app.use(limiter);

//Configuración de CORS
app.use(cors({
    
    origin: ['http://localhost:3000', 'www.everchic.ec', 'everchic.ec', 'https://www.everchic.ec/whatsapp'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Cabeceras permitidas
    credentials: true // Permite enviar cookies de autenticación
}));

app.use('/api/v1', router);
app.use('/api/v1', express.static(path.join(__dirname, 'public')));
app.use('/zohoverify', express.static(path.join(__dirname, 'zohoverify')));


app.get('/get_api', (req, res) => {
    return res.send("Has sido Hackeado 🦠🦠🦠");
});


// Middlewares después de las rutas
app.use(errorHandler);

module.exports = { app };
