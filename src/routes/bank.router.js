const { getAll, create, getOne, remove, update } = require('../controllers/bank.controller');
const express = require('express');

const routerBank = express.Router();

routerBank.route('/')
    .get(getAll)
    .post(create);

routerBank.route('/:id')
    .get(getOne)
    .delete(remove)
    .put(update);

module.exports = routerBank;