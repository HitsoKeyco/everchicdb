const { getAll, create, getOne, remove, update } = require('../controllers/contact.controller');
const express = require('express');

const routerContact = express.Router();

routerContact.route('/')
    .get(getAll)
    .post(create);

routerContact.route('/:id')
    .get(getOne)
    .delete(remove)
    .put(update);

module.exports = routerContact;