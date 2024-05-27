const { getAll, create, getOne, remove, update } = require('../controllers/credit.controller');
const express = require('express');

const routerCredit = express.Router();

routerCredit.route('/')
    .get(getAll)
    .post(create);

routerCredit.route('/:id')
    .get(getOne)
    .delete(remove)
    .put(update);

module.exports = routerCredit;