const catchError = require('../utils/catchError');
const Customer = require('../models/Customer');
const { Op } = require('sequelize');

const getAll = catchError(async (req, res) => {
    const results = await Customer.findAll();
    return res.json(results);
});

const create = catchError(async (req, res) => {
    const result = await Customer.create(req.body);
    return res.status(201).json(result);
});

const getOne = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await Customer.findByPk(id);
    if (!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await Customer.destroy({ where: { id } });
    if (!result) return res.sendStatus(404);
    return res.sendStatus(204);
});

const update = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await Customer.update(
        req.body,
        { where: { id }, returning: true }
    );
    if (result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});

const searchCustomers = catchError(async (req, res) => {
    console.log(req.query);
    const { searchText } = req.query; // Obtén el término de búsqueda desde la consulta
    // Realiza una búsqueda en la base de datos por nombre, apellido, empresa, etc. usando el término de búsqueda
    const results = await Customer.findAll({
        where: {
            [Op.or]: [
                { firstName: { [Op.like]: `%${searchText}%` } },
                { lastName: { [Op.like]: `%${searchText}%` } },
                { company: { [Op.like]: `%${searchText}%` } },
                // Agrega otros campos que quieras incluir en la búsqueda
            ],
        },
    });
    return res.json(results);
});

module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update,
    searchCustomers
}