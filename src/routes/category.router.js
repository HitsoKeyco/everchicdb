const { getAll, create, remove, update } = require('../controllers/category.controller');
const express = require('express');
const { verifyJWT } = require('../utils/VerifyJWT');

const routerCategory = express.Router();

routerCategory.route('/')
    .get(getAll)
    .post(verifyJWT, create) //🔒

routerCategory.route('/:id')
    .delete(verifyJWT, remove)   //🔒

routerCategory.route('/:id')
    
    .put(verifyJWT, update) //

module.exports = routerCategory;