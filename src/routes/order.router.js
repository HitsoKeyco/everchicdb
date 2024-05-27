const { getAllOrdersUser, getAll, create, getOne, remove, update, verifyCaptcha } = require('../controllers/order.controller');
const express = require('express');

const routerOrder = express.Router();

routerOrder.route('/')
    .get(getAll)    
    .post(create)

routerOrder.route('/verify_captcha')
    .post(verifyCaptcha);

routerOrder.route('/:id') 
    .get(getAllOrdersUser)
    .delete(remove)
    .put(update);


module.exports = routerOrder;