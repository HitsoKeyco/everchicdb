const catchError = require('../utils/catchError');
const Category = require('../models/Category');
const Product = require('../models/Product');
const ProductImg = require('../models/ProductImg');
const Tag = require('../models/Tag');
const Size = require('../models/Size');
const Collection = require('../models/Collection');

const getAll = catchError(async (req, res) => {
    const results = await Category.findAll();
    return res.json(results);
});

const create = catchError(async (req, res) => {
    const result = await Category.create(req.body);
    return res.status(201).json(result);
});


// Buscar por categoria con paginacion
const getByCategory = catchError(async (req, res) => {
    const { categoryId, page = 1, limit = 1 } = req.query;
    if (!categoryId) {
        return res.status(400).json({ error: 'categoryId is required' });
    }

    const where = { categoryId: categoryId, deleted_at: false }; // Excluye los productos eliminados
    const offset = (page - 1) * limit; // Calculo del indice a

    try {
        const results = await Product.findAndCountAll({
            include: [Category, ProductImg, Tag, Size, Collection],
            where,
            offset, // Indice desde donde se contaran los elementos
            limit // Cantidad de elementos que se traeran desde el indice offset
        });

        // Contar cantidad de productos
        const count = await Product.count({ where });

        // Calcular el número total de páginas
        const totalPages = Math.ceil(count / parseInt(limit));

        return res.json({
            total: count,
            currentPage: page,
            totalPages,
            products: results.rows
        });
    } catch (error) {
        console.error('Error al obtener productos por categoría:', error);
        return res.status(500).json({ error: 'Error al obtener productos por categoría' });
    }
});




const remove = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await Category.destroy({ where: { id } });
    if (!result) return res.sendStatus(404);
    return res.sendStatus(204);
});

//update 
const update = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await Category.update(req.body, { where: { id } });
    if (!result) return res.sendStatus(404);
    return res.sendStatus(204);
});



module.exports = {
    getAll,
    create,
    remove,
    update,
    getByCategory,
    
}