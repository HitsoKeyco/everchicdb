const catchError = require('../utils/catchError');
const ProductImg = require('../models/ProductImg');
const fs = require("fs")
const path = require("path");
const upload = require('../utils/multer');



const getAll = catchError(async (req, res) => {
    const result = await ProductImg.findAll()
    return res.json(result)
});


const create = catchError(async (req, res) => {
    const smallImage = req.files.smallImage[0];
    const mediumImage = req.files.mediumImage[0];
    const productId = req.body.productId;

    if (!smallImage || !mediumImage) {
        return res.status(400).json({ message: 'Ambos archivos de imagen son requeridos.' });
    }

    try {
        // Aquí podrías guardar las URLs de las imágenes en la base de datos
        const productImg = await ProductImg.create({
            url_small: `${req.protocol}://${req.headers.host}/api/v1/uploads/images_products/small/${smallImage.filename}`,
            url_medium: `${req.protocol}://${req.headers.host}/api/v1/uploads/images_products/medium/${mediumImage.filename}`,
            productId,
            // Otros campos que necesites guardar
        });

        return res.status(201).json(productImg);
    } catch (error) {
        console.error('Error al crear la imagen del producto:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
});



const removeImages = catchError(async (req, res) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send('Se esperaba un arreglo de IDs válido en el cuerpo de la solicitud.');
    }

    for (const id of ids) {
        const result = await ProductImg.findByPk(id);

        if (result) {
            // Obtener los nombres de archivo desde las URLs
            const smallImageFilename = path.basename(result.url_small);
            const mediumImageFilename = path.basename(result.url_medium);

            const smallImagePath = path.join(__dirname, '..', 'public', 'uploads', 'images_products', 'small', smallImageFilename);
            const mediumImagePath = path.join(__dirname, '..', 'public', 'uploads', 'images_products', 'medium', mediumImageFilename);

            // Verificar si los archivos existen antes de eliminarlos
            if (fs.existsSync(smallImagePath)) {
                try {
                    fs.unlinkSync(smallImagePath);
                    console.log(`Archivo pequeño eliminado: ${smallImagePath}`);
                } catch (err) {
                    console.error(`Error al eliminar el archivo pequeño: ${smallImagePath}`, err);
                    return res.status(500).send('Error al eliminar el archivo pequeño del servidor.');
                }
            } else {
                console.warn(`Archivo pequeño no encontrado: ${smallImagePath}`);
            }

            if (fs.existsSync(mediumImagePath)) {
                try {
                    fs.unlinkSync(mediumImagePath);
                    console.log(`Archivo mediano eliminado: ${mediumImagePath}`);
                } catch (err) {
                    console.error(`Error al eliminar el archivo mediano: ${mediumImagePath}`, err);
                    return res.status(500).send('Error al eliminar el archivo mediano del servidor.');
                }
            } else {
                console.warn(`Archivo mediano no encontrado: ${mediumImagePath}`);
            }

            await result.destroy();
        } else {
            console.warn(`Imagen con ID ${id} no encontrada en la base de datos.`);
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