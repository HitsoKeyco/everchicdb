const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('postgres://postgres:root@127.0.0.1:5432/everchicdb', { logging: false })


module.exports = sequelize;