const { getOne, getAll, create, remove, update, login, verifyEmail, recoverPassword, updatePassword, getLikes, createLike, deleteLike, resendVerification } = require('../controllers/user.controller');
const express = require('express');
const { verifyJWT } = require('../utils/VerifyJWT');

const routerUser = express.Router();

routerUser.route('/')
    .get(getAll)
    .post(create);

routerUser.route('/login')
    .post(login)

//Ruta Recover account
routerUser.route('/recover_account')
    .post(recoverPassword)

//Ruta Update password
routerUser.route('/update_password')
    .post(updatePassword)

//Ruta Reenvio de email de verificación
routerUser.route('/resend_email')
    .post(resendVerification)

//Ruta usuarios crear / eliminar like a productos
routerUser.route('/like_product')    
    .post(createLike)
    .delete(deleteLike)

//Ruta 1 usuario 
routerUser.route('/:id')
    .get(getOne)
    

//Ruta usuarios like a productos
routerUser.route('/like_product/:id')
    .get(getLikes)

routerUser.route('/verify/:id')
    .put(verifyEmail)

routerUser.route('/:id')
    .delete(verifyJWT, remove)
    .put(update);

module.exports = routerUser;