const { getAll, create, getOne, remove, update } = require('../controllers/expense.controller');
const express = require('express');

const routerExpense = express.Router();

routerExpense.route('/')
    .get(getAll)
    .post(create);

routerExpense.route('/:id')
    .get(getOne)
    .delete(remove)
    .put(update);

module.exports = routerExpense;