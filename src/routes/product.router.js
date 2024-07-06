const { getAll, getAllAdmin, create, getOne, remove, softDelete, update, setImage, setSizes, setTags, getOneProductOrder, getNewProduct, searchProductByNameOrSKU } = require('../controllers/product.controller');
const express = require('express');
const { verifyJWT } = require('../utils/VerifyJWT');

const routerProduct = express.Router();

routerProduct.route('/')
    .get(getAll)
    .post(verifyJWT, create) //🔒

routerProduct.route('/searchByNameOrSKU')
    .get(searchProductByNameOrSKU)

routerProduct.route('/admin')
    .get(getAllAdmin)

routerProduct.route('/new_product')
    .get(verifyJWT, getNewProduct)

routerProduct.route('/search/:id')
    .get(verifyJWT, getOne)

routerProduct.route('/:id')
    .get(getOneProductOrder)
    .delete(verifyJWT, remove) //🔒
    .put(verifyJWT, update) //🔒

//Eliminado suave ruta
routerProduct.route('/:id/soft_delete')
    .delete(verifyJWT, softDelete)

routerProduct.route('/:id/images')
    .post(setImage)

routerProduct.route('/:productId/addSize/:sizeId')
    .post(setSizes)

routerProduct.route('/:productId/addTag/:tagId')
    .post(setTags)

module.exports = routerProduct;