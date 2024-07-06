const { getAllOrdersUser, getAll, create, remove, update, verifyCaptcha } = require('../controllers/order.controller');
const express = require('express');

const routerOrder = express.Router();

routerOrder.route('/')
    .get(getAll)

routerOrder.route('/create_order')    
    .post(create)

routerOrder.route('/verify_captcha')
    .post(verifyCaptcha);

routerOrder.route('/:id') 
    .get(getAllOrdersUser)
    .delete(remove)
    .put(update);


module.exports = routerOrder;