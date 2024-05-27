const { getAllItemsOrder, getAll, create, getOne, remove, update } = require('../controllers/orderItem.controller');
const express = require('express');

const routerOrderItem = express.Router();

routerOrderItem.route('/')
    .get(getAll)
    .post(create);

routerOrderItem.route('/:id')
    .get(getOne)
    .delete(remove)
    .put(update);

routerOrderItem.route('/order/:orderId')
    .get(getAllItemsOrder);




module.exports = routerOrderItem;