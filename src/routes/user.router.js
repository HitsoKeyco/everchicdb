const { getOne, getAll, createUser, remove, update, login, verifyEmail, recoverPassword, updatePassword, getLikes, upgradeLike, resendVerification, validateSession, limiter } = require('../controllers/user.controller');
const express = require('express');
const { verifyJWT } = require('../utils/VerifyJWT');

const routerUser = express.Router();

routerUser.route('/')
    .get(getAll)
    .post(createUser);

routerUser.route('/login')
    .post(limiter, login)

//Ruta Recover account
routerUser.route('/recover_account')
    .post(recoverPassword)

//Ruta Update password
routerUser.route('/update_password')
    .post(updatePassword)

//Ruta Reenvio de email de verificación
routerUser.route('/resend_email')
    .post(resendVerification)

routerUser.route('/valid_session')
    .get(validateSession)

routerUser.route('/like_update_product')
    .put(upgradeLike)

//Ruta 1 usuario 
routerUser.route('/:id')
    .get(getOne)

//Ruta usuarios like a productos
routerUser.route('/like_product/:id')
    .get(getLikes)

//update Like

routerUser.route('/verify/:id')
    .put(verifyEmail)

routerUser.route('/:id')
    .delete(verifyJWT, remove)
    .put(update);

module.exports = routerUser;