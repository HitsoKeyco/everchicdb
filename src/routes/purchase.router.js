const { getAll, create} = require('../controllers/purchase.controller');
const express = require('express');

const routerPurchase = express.Router();

routerPurchase.route('/')
    .get(getAll)
    .post(create)
    

module.exports = routerPurchase;