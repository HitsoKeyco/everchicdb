const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./utils/errorHandler');
const route = require('./routes'); // Asegúrate de que esta ruta sea correcta
require('dotenv').config();
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
// Middleware de CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'https://www.everchic.ec', 'https://everchic.ec'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Configura el limitador si es necesario
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 2000,
});



// Usa el router con el prefijo /api/v1
app.use('/api/v1', route);

// Ruta raíz de prueba
app.get('/', (req, res) => {
    res.send('Hola, servidor corriendo');
});

// Definir rutas estáticas **antes** de las rutas de la API
app.use('/zohoverify', express.static(path.join(__dirname, 'zohoverify')));
app.use('/api/v1', express.static(path.join(__dirname, 'public')));
app.use(limiter);

// Manejo de errores
app.use(errorHandler);

module.exports = { app };


