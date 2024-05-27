const catchError = require('../utils/catchError');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');

const getAll = catchError(async(req, res) => {
    const results = await OrderItem.findAll();
    return res.json(results);
});

const getAllItemsOrder = catchError(async (req, res) => {
    const { orderId } = req.params;    
    const results = await OrderItem.findAll({ where: { orderId } });
    if (!results || results.length === 0) {
        return res.status(404).json({ message: 'No items found' });
    }
    return res.json(results);
});

const create = catchError(async(req, res) => {
    const result = await OrderItem.create(req.body);
    return res.status(201).json(result);
});

const getOne = catchError(async(req, res) => {
    const { id } = req.params;    
    const result = await OrderItem.findByPk(id);
    if(!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await OrderItem.destroy({ where: {id} });
    if(!result) return res.sendStatus(404);
    return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await OrderItem.update(
        req.body,
        { where: {id}, returning: true }
    );
    if(result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});

module.exports = {
    getAll,
    getAllItemsOrder,    
    create,
    getOne,
    remove,
    update
}