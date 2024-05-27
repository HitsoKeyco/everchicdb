const { getAll, create, getOne, remove, update } = require('../controllers/supplier.controller');
const express = require('express');

const routerSupplier = express.Router();

routerSupplier.route('/')
    .get(getAll)
    .post(create);

routerSupplier.route('/:id')
    .get(getOne)
    .delete(remove)
    .put(update);

module.exports = routerSupplier;