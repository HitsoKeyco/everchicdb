const catchError = require('../utils/catchError');
const Collection = require('../models/Collection');
const Product = require('../models/Product');
const Category = require('../models/Category');
const ProductImg = require('../models/ProductImg');
const Tag = require('../models/Tag');
const Size = require('../models/Size');

const getAll = catchError(async(req, res) => {
    const results = await Collection.findAll();
    return res.json(results);
});

const create = catchError(async(req, res) => {
    const result = await Collection.create(req.body);
    return res.status(201).json(result);
});

const getOne = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await Collection.findByPk(id);
    if(!result) return res.sendStatus(404);
    return res.json(result);
});

const getGroupCollection = catchError(async (req, res) => {
    const { page , limit } = req.query;

    try {
        // Obtener todas las colecciones
        const collections = await Collection.findAll();

        // Array para almacenar grupos de colecciones con productos
        const collectionGroups = [];

        // Iterar sobre cada colección y obtener sus productos
        for (const collection of collections) {
            // Obtener todos los productos de la colección actual
            const products = await Product.findAll({
                where: {
                    collectionId: collection.id,
                    deleted_at: false // Filtrar productos no eliminados
                },
                include: [Category, ProductImg, Tag, Size], // Incluir relaciones de productos si es necesario
            });

            // Si la colección tiene productos, agregarla al array de grupos
            if (products.length > 0) {
                collectionGroups.push({
                    collectionName: collection.name,
                    totalProducts: products.length,
                    products: products
                });
            }
        }

        // Obtener el total de colecciones válidas (con productos)
        const totalCollections = collectionGroups.length;

        // Obtener la colección específica para la página solicitada
        const paginatedCollections = collectionGroups.slice((page - 1) * (limit - 5), page * (limit -5));

        return res.json({
            total: totalCollections, // Total de colecciones válidas (con productos)
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCollections / parseInt(limit - 5)),
            products: paginatedCollections // Colecciones para la página actual con sus productos
        });
    } catch (error) {
        console.error('Error al obtener grupos de colecciones:', error);
        return res.status(500).json({ error: 'Error al obtener grupos de colecciones' });
    }
});


const remove = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await Collection.destroy({ where: {id} });
    if(!result) return res.sendStatus(404);
    return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await Collection.update(
        req.body,
        { where: {id}, returning: true }
    );
    if(result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});

module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update,
    getGroupCollection
}