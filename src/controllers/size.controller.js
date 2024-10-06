const catchError = require('../utils/catchError');
const Size = require('../models/Size');

const getAll = catchError(async(req, res) => {
    const results = await Size.findAll();
    return res.json(results);
});

const create = catchError(async (req, res) => {
    console.log(req.body);

    // Verifica que el cuerpo tenga el formato correcto
    const { size } = req.body; // Desestructura el nombre desde el cuerpo de la solicitud

    // Asegúrate de que `name` no sea vacío
    if (!size) {
        return res.status(400).json({ message: 'la size es requerido.' });
    }

    // Crea un nuevo registro
    const result = await Size.create({ size }); // Envía un objeto con `name`

    return res.status(201).json(result);
});

const getOne = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await Size.findByPk(id);
    if(!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await Size.destroy({ where: {id} });
    if(!result) return res.sendStatus(404);
    return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await Size.update(
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
    update
}