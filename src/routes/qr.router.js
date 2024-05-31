// routes.js
const express = require('express');
const { initializeWhatsAppClient } = require('./whatsapp');

const router = express.Router();

// Ruta para obtener el código QR
router.get('/qr-code', async (req, res) => {
    try {
        const qrCodeDataURL = await initializeWhatsAppClient();
        res.send(qrCodeDataURL);
    } catch (error) {
        res.status(500).send('Error al obtener el código QR');
    }
});

module.exports = router;
