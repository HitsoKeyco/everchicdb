const catchError = require('../utils/catchError');
const ProductImg = require('../models/ProductImg');
const fs = require("fs")
const path = require("path");
const { log } = require('console');

const getAll = catchError(async (req, res) => {
    const result = await ProductImg.findAll()
    return res.json(result)
});

const create = catchError(async (req, res) => {
    const { filename } = req.file
    const url = `${req.protocol}://${req.headers.host}/uploads/${filename}`
    const result = await ProductImg.create({ filename, url })
    return res.status(201).json(result)
})


const removeImages = catchError(async (req, res) => {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send('Se esperaba un arreglo de IDs válido en el cuerpo de la solicitud.');
    }

    for (const id of ids) {
        const result = await ProductImg.findByPk(id);

        if (result) {
            fs.unlinkSync(path.join(__dirname, '..', 'public', 'uploads', `${result.filename}`));
            await result.destroy();
        }
    }

    return res.sendStatus(204);
});




const update = catchError(async (req, res) => {
    const { id } = req.params; // ID de la imagen que deseas actualizar
    const { filename } = req.file; // Nueva imagen que se cargará

    // Verificar si la imagen con el ID especificado existe
    const existingImage = await ProductImg.findByPk(id);

    if (!existingImage) {
        return res.sendStatus(404); // La imagen no se encontró, puedes manejar esto de acuerdo a tus necesidades
    }

    // Construir la URL de la nueva imagen
    const newUrl = `${req.protocol}://${req.headers.host}/uploads/${filename}`;

    // Actualizar la información de la imagen en la base de datos
    existingImage.filename = filename;
    existingImage.url = newUrl;
    await existingImage.save();

    // Si es necesario, puedes eliminar la imagen anterior
    if (existingImage.filename !== filename) {
        fs.unlinkSync(path.join(__dirname, '..', 'public', 'uploads', existingImage.filename));
    }

    return res.status(200).json(existingImage);
});


module.exports = {
    getAll,
    create,    
    removeImages,
    update
}