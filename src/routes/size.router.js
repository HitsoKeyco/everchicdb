const { getAll, create, getOne, remove, update } = require('../controllers/size.controller');
const express = require('express');

const routerSize = express.Router();

routerSize.route('/')
    .get(getAll)
    .post(create);

routerSize.route('/:id')
    .get(getOne)
    .delete(remove)
    .put(update);

module.exports = routerSize;