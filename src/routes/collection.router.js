const { getAll, create, getOne, remove, update } = require('../controllers/collection.controller');
const express = require('express');

const routerCollection = express.Router();

routerCollection.route('/')
    .get(getAll)
    .post(create);

routerCollection.route('/:id')
    .get(getOne)
    .delete(remove)
    .put(update);

module.exports = routerCollection;