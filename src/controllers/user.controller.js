const catchError = require('../utils/catchError');
const User = require('../models/User');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/sendEmail');
const generateVerificationToken = require('../utils/verifyToken');
const saveVerificationToken = require('../utils/saveVerificationToken');
const { findUserByVerificationToken } = require('../utils/findUserByVerificationToken');
const ProductLike = require('../models/ProductLike');




const getAll = catchError(async (req, res) => {
    const results = await User.findAll();
    return res.json(results);
});

// ------------Buscar datos de usuario ----------------
const getOne = catchError(async (req, res) => {
    const { id } = req.params;
    const results = await User.findOne({ where: { id } });
    return res.json(results);
});


const create = catchError(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);

    // Crear el usuario en la base de datos
    const newUser = await User.create({ firstName, lastName, email, password: hashPassword });

    // Generar un token de verificación único (puedes utilizar una librería como 'uuid' para esto)
    const verificationToken = generateVerificationToken(); // Esta función debe ser implementada para generar un token único

    // Guardar el token de verificación en la base de datos, asociado al usuario
    await saveVerificationToken(newUser.id, verificationToken); // Esta función debe ser implementada

    // Construir el enlace de verificación
    const verificationLink = `${process.env.FRONTEND_URL}/verify/${verificationToken}`; // Esta URL debe ser la URL de tu aplicación frontend    

    // Configurar el correo electrónico
    const mailOptions = {
        to: email,
        subject: 'Verificación de Correo Electrónico Everchic',
        html: `Por favor, haz clic en el siguiente enlace para verificar tu correo electrónico: <a href="${verificationLink}">${verificationLink}</a>`
    };

    // Enviar el correo electrónico de verificación
    sendEmail(mailOptions);

    return res.status(201).json(newUser);
});


// Controlador para manejar la solicitud de verificación de correo electrónico
const verifyEmail = catchError(async (req, res) => {
    const { id } = req.params;
    const user = await findUserByVerificationToken(id);
    if (user) {
        await markUserAsVerified(user.id);
        res.sendStatus(200);
    } else {
        res.status(400).send('No se encontró un usuario con este token de verificación.');
    }
});

const markUserAsVerified = async (userId) => {
    try {
        // Actualiza el campo isVerify a true y elimina el token de verificación de la base de datos
        await User.update({ isVerify: true, verificationToken: null }, { where: { id: userId } });
    } catch (error) {
        console.error('Error al marcar al usuario como verificado:', error);
        throw new Error('Error al marcar al usuario como verificado');
    }
};


const remove = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await User.destroy({ where: { id } });
    if (!result) return res.sendStatus(404);
    return res.sendStatus(204);
});



const update = catchError(async (req, res) => {
    const { id } = req.params;
    //evita la actualizacion del email y el password
    delete req.body.email
    delete req.body.password

    const result = await User.update(
        req.body,
        { where: { id }, returning: true }
    );
    if (result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);


});



// Endpoint de Login
const login = catchError(async (req, res) => {
    const { email, password } = req.body;

    // Comprobamos si existe el usuario
    const user = await User.findOne({ where: { email, isVerify: true } });
    if (!user) return res.sendStatus(401).json({ message: "Usuario no encontrado o no verificado" });

    // Comprobamos si la contraseña es válida
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.sendStatus(401);

    // Anexamos hash para validar al usuario o caducar la sesión
    const token = jwt.sign(
        { user },
        process.env.TOKEN_SECRET,
        { expiresIn: "1d" }
    );

    return res.json({ user, token });
});

//Endpoint Recover password
const recoverPassword = catchError(async (req, res) => {
    const { email } = req.body;

    // Comprobamos si el usuario existe
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Generamos un token que caduca en 1 día
    const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, { expiresIn: "1d" });

    // Creamos el enlace de verificación
    const verificationLink = `${process.env.FRONTEND_URL}/recover_account/${token}`;

    // Configuramos las opciones del correo
    const mailOptions = {
        to: email,
        subject: 'Restablecimiento de contraseña - Everchic',
        html: `Por favor, haz clic en el siguiente enlace para restablecer tu contraseña: <a href="${verificationLink}">${verificationLink}</a>`
    };

    // Enviamos el correo electrónico
    try {
        await sendEmail(mailOptions);
        return res.json({ message: "Se ha enviado un correo de recuperación" });
    } catch (error) {
        console.error('Error al enviar el correo electrónico:', error);
        return res.status(500).json({ message: "Error al enviar el correo de recuperación" });
    }
});


//Endpoint Update password
const updatePassword = catchError(async (req, res) => {
    const { token, password } = req.body;
    // Verificar y decodificar el token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (err) {
        return res.status(400).json({ message: "Token inválido o expirado" });
    }

    // Buscar al usuario en la base de datos
    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Hash de la nueva contraseña
    const hash = await bcrypt.hash(password, 10);

    // Actualizar la contraseña en la base de datos
    await User.update({ password: hash }, { where: { id: decoded.id } });

    return res.json({ message: "Contraseña actualizada" });
});

//Endpoint getAll likes
const getLikes = catchError(async (req, res) => {
    try {
        const { id } = req.params;
        const likes = await ProductLike.findAll({ where: { userId: id } });
        return res.json(likes);
    } catch (error) {
        console.error("Error al obtener likes:", error);
        return res.status(500).json({ error: "Error al obtener likes o no tenga likes" });
    }
});



//Endpoint like user create
const createLike = catchError(async (req, res) => {
    try {
        const { userId, productId } = req.body;        
        const like = await ProductLike.create({ userId: userId, productId: productId });
        return res.json(like);
    } catch (error) {
        console.error("Error al crear like:", error);
        return res.status(500).json({ error: "Error al crear like" });
    }

});



//Endpoint quitar like 
const deleteLike = catchError(async (req, res) => {

    try {
        const { userId, productId } = req.body;        
        const like = await ProductLike.destroy({ where: { userId: userId, productId: productId } });
        return res.json(like);
    } catch (error) {
        console.error("Error al quitar like:", error);
        return res.status(500).json({ error: "Error al quitar like" });
    }

});

module.exports = {
    getOne,
    getAll,
    create,
    remove,
    update,
    login,
    verifyEmail,
    recoverPassword,
    updatePassword,
    getLikes,
    createLike,
    deleteLike

}