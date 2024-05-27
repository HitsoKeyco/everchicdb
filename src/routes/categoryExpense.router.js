const { getAll, create, getOne, remove, update } = require('../controllers/categoryExpense');
const express = require('express');

const routerCategoryExpense = express.Router();

routerCategoryExpense.route('/')
    .get(getAll)
    .post(create);

routerCategoryExpense.route('/:id')
    .get(getOne)
    .delete(remove)
    .put(update);

module.exports = routerCategoryExpense;