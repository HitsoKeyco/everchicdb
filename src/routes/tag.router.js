const { getAll, create, getOne, remove, update } = require('../controllers/Tag.controller');
const express = require('express');

const routerTag = express.Router();

routerTag.route('/')
    .get(getAll)

routerTag.route('/remove/:id')
    .delete(remove);

routerTag.route('/:id')
    .get(getOne)
    .put(update);

routerTag.route('/:productId/relateTags')
    .post(create);
    
module.exports = routerTag;