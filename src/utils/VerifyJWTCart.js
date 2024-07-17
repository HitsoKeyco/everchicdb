const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyJWTcart = (token, userId) => {    try {        
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);        
        // Aquí puedes agregar más validaciones si es necesario
        if (!decoded.userId || decoded.userId !== userId) {
            throw new Error('Token inválido');
        }
        return decoded.userId;
    } catch (error) {
        console.error('Error al verificar el token:', error);
        throw new Error(`Token inválido: ${error.message}`);
    }
};

module.exports = verifyJWTcart
