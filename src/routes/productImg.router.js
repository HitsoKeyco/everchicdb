const { getAll, create, remove, removeImages, update } = require('../controllers/productImg.controller');
const express = require('express');
const upload = require('../utils/multer');

const routerProductImg = express.Router();

routerProductImg.route('/')
    .get(getAll)
    .post(upload.single('image'), create);

routerProductImg.route("/:id")
    .put(update) // Agregamos la referencia al controlador de actualización

routerProductImg.route("/remove")
    .delete(removeImages);

module.exports = routerProductImg;