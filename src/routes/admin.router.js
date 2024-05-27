const { getAll, create, getOne, remove, update, login,  } = require('../controllers/admin.controller');
const express = require('express');
const { verifyJWT } = require('../utils/VerifyJWT');

const routerAdmin = express.Router();

routerAdmin.route('/')
    .get(getAll)
    .post(create);
    
routerAdmin.route('/login')
    .post(login)

routerAdmin.route('/:id')
    .get(getOne)
    .delete(remove)
    .put(update);

module.exports = routerAdmin;