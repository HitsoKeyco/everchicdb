const { getAll, closeSession } = require('../controllers/whatsapp.controller');
const express = require('express');

const routerWhatsapp = express.Router();

routerWhatsapp.route('/qr')
    .get(getAll)
    
routerWhatsapp.route('/close_session')
    .get(closeSession)
    
module.exports = routerWhatsapp;