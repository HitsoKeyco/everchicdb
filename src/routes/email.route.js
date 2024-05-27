const express = require('express');
const { sendEmail } = require('../utils/sendEmail');
const routerEmail = express.Router();


routerEmail.post('/emails/contact', (req, res) => {
    const { name, email, message } = req.body

    sendEmail({
        to: email,
        subject:'Verificacion Everchic',
        text:'Test de verificacion'

    })
})