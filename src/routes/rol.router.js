const { getAll, create, getOne, remove, update } = require('../controllers/rol.controller');
const express = require('express');

const routerRol = express.Router();

routerRol.route('/')
    .get(getAll)
    .post(create);

routerRol.route('/:id')
    .get(getOne)
    .delete(remove)
    .put(update);

module.exports = routerRol;