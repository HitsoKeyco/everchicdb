const catchError = require('../utils/catchError');
const Tag = require('../models/Tag');
const ProductTag = require('../models/ProductTag');

const getAll = catchError(async (req, res) => {
    const results = await Tag.findAll();
    return res.json(results);
});

const create = catchError(async (req, res) => {
    const tagDataArray = req.body;

    // Verifica si tagDataArray es un arreglo y contiene elementos
    if (!Array.isArray(tagDataArray)) {
        return res.status(400).json({ error: 'Se requiere un arreglo válido de tags' });
    }

    // Verifica si tagDataArray tiene elementos
    if (tagDataArray.length === 0) {
        return res.status(200).json({ message: 'No se proporcionaron tags. No se realizaron cambios.' });
    }

    try {
        const createdTags = await Promise.all(
            tagDataArray.map(async (tagData) => {
                let tag;

                // Si tagData es un objeto, asume que tiene la propiedad 'name'
                if (typeof tagData === 'object' && tagData.name) {
                    tag = await Tag.findOne({ where: { name: tagData.name } });

                    if (!tag) {
                        // Si la etiqueta no existe, créala y relaciona con el producto
                        tag = await Tag.create({ name: tagData.name });
                    }

                    // Relaciona la etiqueta existente con el producto
                    await ProductTag.findOrCreate({
                        where: { productId: req.params.productId, tagId: tag.id },
                        defaults: { productId: req.params.productId, tagId: tag.id }
                    });
                } else if (typeof tagData === 'string') {
                    tag = await Tag.findOne({ where: { name: tagData } });

                    if (!tag) {
                        // Si la etiqueta no existe, créala y relaciona con el producto
                        tag = await Tag.create({ name: tagData });
                    }

                    // Relaciona la etiqueta existente con el producto
                    await ProductTag.findOrCreate({
                        where: { productId: req.params.productId, tagId: tag.id },
                        defaults: { productId: req.params.productId, tagId: tag.id }
                    });
                } else {
                    // Si tagData no es ni objeto ni string, ignóralo
                    return null;
                }

                return tag;
            })
        );

        // Filtra las etiquetas nulas que pudieron haberse generado por elementos no válidos en tagDataArray
        const validTags = createdTags.filter((tag) => tag !== null);

        // Verifica si no hay tags válidos después de procesar tagDataArray
        if (validTags.length === 0) {
            return res.status(400).json({ error: 'Ningún tag válido fue proporcionado' });
        }

        return res.status(201).json(validTags);
    } catch (error) {
        console.error('Error al crear y relacionar tags:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});




const getOne = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await Tag.findByPk(id);
    if (!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async (req, res) => {
    const { id } = req.params;
    const { ids } = req.body; // Suponiendo que los IDs están en el cuerpo de la solicitud
    
    // Validar si 'ids' es un array
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de IDs válido' });
    }

    try {
        // Utilizar el método 'destroy' con la condición 'where' para eliminar múltiples tags
        const result = await ProductTag.destroy({ where: { productId: id, tagId: ids } });

        // Verificar si se eliminó al menos un productTag
        if (result > 0) {
            return res.sendStatus(204);
        } else {
            return res.sendStatus(404);
        }
    } catch (error) {
        console.error('Error al eliminar los tags:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});



const update = catchError(async (req, res) => {
    const tagDataArray = req.body;

    // Verifica si tagDataArray es un arreglo y contiene elementos
    if (!Array.isArray(tagDataArray) || tagDataArray.length === 0) {
        return res.status(400).json({ error: 'Se requiere un arreglo válido de tags' });
    }

    try {
        const createdTags = await Promise.all(
            tagDataArray.map(async (tagData) => {
                let tag;

                // Si tagData es un objeto, asume que tiene la propiedad 'name'
                if (typeof tagData === 'object' && tagData.name) {
                    tag = await Tag.findOne({ where: { name: tagData.name } });

                    if (!tag) {
                        // Si la etiqueta no existe, créala y relaciona con el producto
                        tag = await Tag.create({ name: tagData.name });
                    }

                    // Relaciona la etiqueta existente con el producto
                    await ProductTag.findOrCreate({
                        where: { productId: req.params.productId, tagId: tag.id },
                        defaults: { productId: req.params.productId, tagId: tag.id }
                    });
                } else if (typeof tagData === 'string') {
                    tag = await Tag.findOne({ where: { name: tagData } });

                    if (!tag) {
                        // Si la etiqueta no existe, créala y relaciona con el producto
                        tag = await Tag.create({ name: tagData });
                    }

                    // Relaciona la etiqueta existente con el producto
                    await ProductTag.findOrCreate({
                        where: { productId: req.params.productId, tagId: tag.id },
                        defaults: { productId: req.params.productId, tagId: tag.id }
                    });
                } else {
                    // Si tagData no es ni objeto ni string, ignóralo
                    return null;
                }

                return tag;
            })
        );

        // Filtra las etiquetas nulas que pudieron haberse generado por elementos no válidos en tagDataArray
        const validTags = createdTags.filter((tag) => tag !== null);

        return res.status(201).json(validTags);
    } catch (error) {
        console.error('Error al crear y relacionar tags:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update
}