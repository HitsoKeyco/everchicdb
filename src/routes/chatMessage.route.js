const { getAll, create, getOne, remove, update } = require('../controllers/chatMessage.controller');
const express = require('express');

const routerChatMessage = express.Router();

routerChatMessage.route('/')
    .get(getAll)
    .post(create)

module.exports = routerChatMessage;