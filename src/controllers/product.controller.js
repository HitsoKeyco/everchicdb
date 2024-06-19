const catchError = require('../utils/catchError');
const sequelize = require('../utils/connection');
const Product = require('../models/Product');
const Category = require('../models/Category');
const ProductImg = require('../models/ProductImg');
const Tag = require('../models/Tag');
const Supplier = require('../models/Supplier');
const Size = require('../models/Size');
const ProductSize = require('../models/ProductSize');
const ProductTag = require('../models/ProductTag');
const Collection = require('../models/Collection');

const getbyCategory = catchError(async (req, res) => {
    const results = await Category.findAll({
        include: [
            { model: Category },
            { model: ProductImg },
            { model: Tag }
        ]
    });
    return res.json(results);
});


const getAll = catchError(async (req, res) => {
    const { page = 1, limit = 1 } = req.query;
    const where = { deleted_at: null }; // Excluye los productos eliminados

    const offset = (page - 1) * limit;  //calculo del indice a recuperar por pagina
    const results = await Product.findAndCountAll({
        include: [Category, ProductImg, Tag, Size, Collection],
        where,
        offset, //indice desde donde se contaran los elementos
        limit  // cantidad de elementos qye se traeran desde el indice offset
    });

    //count cantidad en valor numerico de elementos, rows elementos del arreglo
    const { count, rows } = results;

    return res.json({
        total: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit) - 1,
        products: rows
    });
});


const create = catchError(async (req, res) => {
    const result = await Product.create(req.body);
    return res.status(201).json(result);
});

const getOne = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await Product.findByPk(id, { include: [Category, ProductImg, Tag, Supplier, Size, Collection] });
    if (!result) return res.sendStatus(404);
    return res.json(result);
});

const getNewProduct = catchError(async (req, res) => {
    //encontrar productos donde tenga la columna new_products igual a true    
    const result = await Product.findAll({
        where: {
            new_product: true
        },
        include: [Category, ProductImg, Tag, Supplier, Size, Collection]
    });
    return res.json(result);
})

const getOneProductOrder = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await Product.findByPk(id, { include: [Category, ProductImg, Size, Collection] });
    if (!result) return res.sendStatus(404);
    return res.json(result);
})

const remove = catchError(async (req, res) => {
    const { id } = req.params;

    // Utilizar transacciones para garantizar la atomicidad de las operaciones
    const result = await sequelize.transaction(async (t) => {
        // Eliminar imágenes y tags asociadas al producto
        await ProductImg.destroy({ where: { productId: id }, transaction: t });
        await ProductTag.destroy({ where: { productId: id }, transaction: t });


        // Eliminar el producto principal
        const deleteProductResult = await Product.destroy({ where: { id }, transaction: t });

        return deleteProductResult; // Devolver el resultado de la eliminación del producto principal
    });

    // Verificar si se eliminó al menos un producto
    if (result > 0) {
        return res.sendStatus(204);
    } else {
        return res.sendStatus(404);
    }
});


const update = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await Product.update(
        req.body,
        { where: { id }, returning: true }
    );
    if (result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});



const setImage = catchError(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
        return res.sendStatus(404);
    }

    // Asumiendo que req.body es un array de IDs de imágenes ya creadas
    const imageIds = req.body;

    // Verificar si hay imágenes existentes
    const currentImages = await product.getProductImgs({ attributes: ['id'] });

    if (currentImages.length > 0) {
        // Agregar los IDs de las nuevas imágenes al producto
        await product.addProductImgs(imageIds);
    } else {
        // Si no hay imágenes existentes, establecer las nuevas imágenes directamente
        await product.setProductImgs(imageIds);
    }

    // Obtener y devolver todas las imágenes asociadas con el producto
    const images = await product.getProductImgs();
    return res.json(images);
});




const setSizes = catchError(async (req, res) => { // => '/:productId/addSize/:sizeId'
    try {
        const { productId, sizeId } = req.params;
        const product = await Product.findByPk(productId);
        const size = await Size.findByPk(sizeId);

        if (!product || !size) {
            return res.status(404).json({ message: 'Producto o talla no encontrada' });
        }

        await ProductSize.create({ productId, sizeId });

        return res.status(200).json({ message: 'Talla asignada al producto correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
});

const setTags = catchError(async (req, res) => {   // => :productId/addTag/:tagId'
    try {
        const { productId, tagId } = req.params;
        const product = await Product.findByPk(productId);
        const tag = await Tag.findByPk(tagId);
        if (!product || !tag) {
            return res.status(404).json({ message: 'Producto o tag no encontrada' });
        }
        await ProductTag.create({ productId, tagId });
        return res.status(200).json({ message: 'tag asignado al producto correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
})

const softDelete = catchError(async (req, res) => {
    const { id } = req.params;

    // Buscar el producto por su ID
    const product = await Product.findByPk(id);

    // Verificar si el producto existe
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Marcar el producto como eliminado estableciendo la fecha de eliminación
    product.deleted_at = new Date();
    await product.save();

    return res.json({ message: 'Product deleted successfully' });
});

module.exports = {
    getOneProductOrder,
    getbyCategory,
    getAll,
    create,
    getOne,
    remove,
    softDelete,
    update,
    setImage,
    setSizes,
    setTags,
    getNewProduct
}