const catchError = require('../utils/catchError');
const sequelize = require('../utils/connection');
const Product = require('../models/Product');
const Category = require('../models/Category');
const ProductImg = require('../models/ProductImg');
const Tag = require('../models/Tag');
const Size = require('../models/Size');
const ProductSize = require('../models/ProductSize');
const ProductTag = require('../models/ProductTag');
const Collection = require('../models/Collection');
const { Op } = require('sequelize');

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
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);

    const where = { deleted_at: false }; // Excluye los productos eliminados
    const offset = (page - 1) * limit;  // Cálculo del índice a recuperar por página

    try {
        // Consulta para obtener los productos con sus relaciones y aplicando el where
        const results = await Product.findAll({
            include: [Category, ProductImg, Tag, Size, Collection],
            where,
            offset, // Índice desde donde se contarán los elementos
            limit   // Cantidad de elementos que se traerán desde el índice offset
        });

        // Consulta para contar todos los productos sin límite ni offset
        const count = await Product.count();

        // Calcula el número total de páginas necesarias
        const totalPages = Math.ceil(count / limit);

        return res.json({
            total: count,
            currentPage: page,
            totalPages,
            products: results
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error retrieving products' });
    }
});


const getAllAdmin = catchError(async (req, res) => {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const offset = (page - 1) * limit;

    try {
        // Consulta para obtener los productos paginados con sus relaciones
        const results = await Product.findAll({
            include: [Category, ProductImg, Tag, Size, Collection],
            offset,
            limit
        });

        // Consulta para contar todos los productos sin límite ni offset
        const count = await Product.count();

        // Calcula el número total de páginas necesarias
        const totalPages = Math.ceil(count / limit);

        return res.json({
            total: count,
            currentPage: page,
            totalPages,
            products: results
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error retrieving products' });
    }
});

const create = catchError(async (req, res) => {
    const result = await Product.create(req.body);
    return res.status(201).json(result);
});

const getOne = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await Product.findByPk(id, { include: [Category, ProductImg, Size, Collection, Tag] });
    if (!result) return res.sendStatus(404);
    return res.json(result);
});

const getNewProduct = catchError(async (req, res) => {
    //encontrar productos donde tenga la columna new_products igual a true    
    const result = await Product.findAll({
        where: {
            new_product: true,
            deleted_at: false,
        },
        include: [Category, ProductImg, Tag, Size, Collection]
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


const updateProduct = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await Product.update(
        req.body,
        { where: { id }, returning: true }
    );
    if (result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});

const updateProductOrder = catchError(async (req, res) => {
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

//Busqueda de productos por Title o SKU
const searchProductByNameOrSKU = catchError(async (req, res) => {
    const { title, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let whereCondition = {};

    if (title) {
        const lowerCaseTitle = title.toLowerCase(); // Convertir el título a minúsculas
        whereCondition = {
            [Op.or]: [
                {
                    title: {
                        [Op.iLike]: `%${lowerCaseTitle}%` // Usar Op.iLike para no ser sensible a mayúsculas>
                    }
                },
                {
                    sku: {
                        [Op.iLike]: `%${lowerCaseTitle}%`
                    }
                }
            ]
        };
    }

    try {
        // Contar todos los productos que coinciden con la condición
        const countResult = await Product.count({
            where: whereCondition
        });

        // Obtener los productos para la página actual
        const products = await Product.findAll({
            where: whereCondition,
            include: [Category, ProductImg, Tag, Size, Collection],
            offset,
            limit
        });

        // Calcular el número total de páginas
        const totalPages = Math.ceil(countResult / limit);

        res.json({
            total: countResult,
            currentPage: page,
            totalPages,
            products
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving products' });
    }
});




module.exports = {
    getOneProductOrder,
    getbyCategory,
    getAll,
    getAllAdmin,
    create,
    getOne,
    remove,
    softDelete,
    updateProduct,
    updateProductOrder,
    setImage,
    setSizes,
    setTags,
    getNewProduct,
    searchProductByNameOrSKU,
}