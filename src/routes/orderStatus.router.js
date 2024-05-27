const { getAll, create, getOne, remove, update } = require('../controllers/orderStatus.controller');
const express = require('express');

const routerOrderStatus = express.Router();

routerOrderStatus.route('/')
    .get(getAll)
    .post(create);

routerOrderStatus.route('/:id')
    .get(getOne)
    .delete(remove)
    .put(update);

module.exports = routerOrderStatus;