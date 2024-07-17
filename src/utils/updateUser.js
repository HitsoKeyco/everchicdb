const User = require("../models/User");

const updateUser = async (userCartData, user) => {
    try {
        // Eliminar campos sensibles que no deben ser actualizados directamente
        delete userCartData.email;
        delete userCartData.password;

        // Actualizar el usuario con los datos proporcionados
        const id = user.id;
        const [rowsUpdated, updatedUsers] = await User.update(
            { ...userCartData }, // Solo actualiza los campos permitidos
            { where: { id }, returning: true, attributes: { exclude: ['password'] } } // Excluye el campo 'password'
        );

        if (rowsUpdated === 0) {
            throw new Error('No se pudo encontrar o actualizar el usuario');
        }

        // Devolver el usuario actualizado, excluyendo explícitamente el campo 'password'
        return updatedUsers[0];

    } catch (error) {
        console.error('Error al actualizar el usuario:', error.message);
        throw error; // Propagar el error para manejarlo en el contexto superior
    }
};

module.exports = { updateUser };
