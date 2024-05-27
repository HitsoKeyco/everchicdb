const ChatMessage = require('../models/ChatMessage');
const catchError = require('../utils/catchError');


const getAll = catchError(async (req, res) => {
    const results = await ChatMessage.findAll();
    return res.json(results);
});

const create = catchError(async (req, res) => {
    const { message, userId } = req.body;
    try {
        const newMessage = await ChatMessage.create({ message, userId });
        // Aquí puedes emitir el nuevo mensaje a todos los clientes conectados utilizando Socket.io
        return res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

const getOne = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await ChatMessage.findByPk(id);
    if (!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await ChatMessage.destroy({ where: { id } });
    if (!result) return res.sendStatus(404);
    return res.sendStatus(204);
});

const update = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await ChatMessage.update(
        req.body,
        { where: { id }, returning: true }
    );
    if (result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});

module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update
}