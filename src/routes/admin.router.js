const { getAll, create, getOne, remove, update, login, getQrCode, logOutWhatsapp, getStatusClient  } = require('../controllers/admin.controller');
const express = require('express');
const { verifyJWT } = require('../utils/VerifyJWT');

const routerAdmin = express.Router();

routerAdmin.route('/')
    .get(getAll)
    .post(create);
    
routerAdmin.route('/login')
    .post(login)

routerAdmin.route('/qr_code')
    .get(getQrCode)
    
routerAdmin.route('/client_whatsapp')
    .get(getStatusClient)

routerAdmin.route('/logout_session_whatsapp')
    .post(logOutWhatsapp)

routerAdmin.route('/:id')
    .get(getOne)
    .delete(remove)
    .put(update);

module.exports = routerAdmin;