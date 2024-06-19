const { getAll, create, getOne, remove, update, getGroupCollection } = require('../controllers/collection.controller');
const express = require('express');

const routerCollection = express.Router();

routerCollection.route('/')
    .get(getAll)
    .post(create);

routerCollection.route('/group_collection')
    .get(getGroupCollection)

routerCollection.route('/:id')
    .get(getOne)
    .delete(remove)
    .put(update);

module.exports = routerCollection;