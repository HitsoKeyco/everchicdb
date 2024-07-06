const { getAll, create, getOne, remove, update } = require('../controllers/whatsapp.controller');
const express = require('express');

const routerWhatsapp = express.Router();

routerWhatsapp.route('/qr')
    .get(getAll)
    
module.exports = routerWhatsapp;