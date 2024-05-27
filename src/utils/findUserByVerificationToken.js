// Importa el modelo de usuario y la conexión a la base de datos
const User = require('../models/User');
const sequelize = require('../utils/connection');

// Función para buscar al usuario por el token de verificación
const findUserByVerificationToken = async (verificationToken) => {
    try {
        // Realiza la consulta a la base de datos para encontrar al usuario con el token de verificación proporcionado
        const user = await User.findOne({ where: { verificationToken: verificationToken } });
        return user; // Retorna el usuario encontrado (o null si no se encontró ningún usuario)
    } catch (error) {
        console.error('Error al buscar al usuario por el token de verificación:', error);
        throw new Error('Error al buscar al usuario por el token de verificación');
    }
};

module.exports = {
    findUserByVerificationToken,
};
