const User = require('../models/User');

// Función para guardar el token de verificación en la base de datos, asociado al usuario
const saveVerificationToken = async (userId, token) => {
    try {
        // Actualizar el usuario en la base de datos para incluir el token de verificación
        await User.update({ verificationToken: token }, { where: { id: userId } });
        console.log('Token de verificación guardado en la base de datos.');
    } catch (error) {
        console.error('Error al guardar el token de verificación:', error);
        throw new Error('Error al guardar el token de verificación en la base de datos.');
    }
};

module.exports = saveVerificationToken;
