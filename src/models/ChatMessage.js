const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const ChatMessage = sequelize.define('ChatMessage', {
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

module.exports = ChatMessage;
