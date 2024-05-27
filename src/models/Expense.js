const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection'); // Asegúrate de configurar correctamente tu conexión a la base de datos

const Expense = sequelize.define('Expense', {
  // Fecha del gasto
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Descripción del gasto
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Fecha del gasto
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  // Fecha maxima de pago
  max_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Monto del gasto
  amount: {
    type: DataTypes.DECIMAL(10, 2), // Decimal con 2 decimales
    allowNull: false,
  },
  // Categoría del gasto
  category: {
    type: DataTypes.STRING,
  },
  // Método de pago
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Número de recibo o factura
  receiptNumber: {
    type: DataTypes.STRING,
  },
  bank: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Estado del gasto (pendiente, aprobado, rechazado, etc.)
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pendiente', // Valor por defecto
  },
  // Usuario asociado al gasto
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ruc: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sub0: {
    type: DataTypes.DECIMAL(10, 2), // Decimal con 2 decimales
    allowNull: false,
  },
  sub12: {
    type: DataTypes.DECIMAL(10, 2), // Decimal con 2 decimales
    allowNull: false,
  },
  //categoryExpenseId
  //supplierId
  
});


module.exports = Expense;
