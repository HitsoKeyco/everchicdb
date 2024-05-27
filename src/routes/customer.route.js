const { getAll, create, getOne, remove, update, searchCustomers } = require('../controllers/customer.controller');
const express = require('express');

const routerCustomer = express.Router();

routerCustomer.route('/')
    .get(getAll)
    .post(create);

routerCustomer.route('/search')
    .get(searchCustomers);

routerCustomer.route('/:id')
    .get(getOne)
    .delete(remove)
    .put(update);

module.exports = routerCustomer;