const catchError = require('../utils/catchError');
const Order = require('../models/Order');
const User = require('../models/User');

const OrderItem = require('../models/OrderItem');
const { verify } = require('hcaptcha');
const OrderStatus = require('../models/OrderStatus');
const sequelize = require('../utils/connection');
const { createUser } = require('../utils/createUser');
const { sendMessageWhatsapp } = require('../sendOrderWhatsapp');
const Product = require('../models/Product');
const { Op } = require('sequelize');
const { validationCart } = require('../utils/validationCart');


const getAll = catchError(async (req, res) => {
    const results = await Order.findAll();
    return res.status(200).json(results);
})

const getAllOrdersUser = catchError(async (req, res) => {
    const { id } = req.params;
    const results = await Order.findAll({ where: { userId: id } });
    if (!results) res.status(404).json({ message: 'No orders found' });
    return res.status(200).json(results);
});

const verifyCaptcha = async (req, res) => {
    const { tokenCaptcha } = req.body;
    const SECRET_KEY = process.env.HCAPTCHA_SECRET
    const RESPONSE_TOKEN = tokenCaptcha;

    try {
        const data = await verify(SECRET_KEY, RESPONSE_TOKEN);

        if (data.success) {
            res.status(200).json({ message: 'Captcha válido. Formulario procesado correctamente.' });
        } else {
            res.status(400).json({ message: 'Error: Captcha inválido.' });
        }
    } catch (error) {
        console.error('Error al verificar el captcha:', error);
        res.status(500).json({ message: 'Error al procesar la solicitud.' });
    }
};


const create = catchError(async (req, res) => {
    const { cart, cartFree, userData, price_unit, total, isPriceShipping } = req.body;
    const result = await validationCart(cart, cartFree, price_unit, total, isPriceShipping)

    if (result.cartJoinFiltered.length === 0 && result.failOperation === false) {
        let user
        try {
            await sequelize.transaction(async (transaction) => {
                // Verificar si el usuario ya existe
                const userDB = await User.findOne({ where: { email: userData.email }, transaction });

                if (userDB) {
                    await transaction.rollback();
                    return res.status(400).json({ message: 'El usuario ya existe. Por favor inicia sesión' });
                }

                // Crear usuario si no existe
                if (!userDB) {
                    user = await createUser(userData, transaction);
                }

                // Encontrar el estado de orden 'pendiente'
                const orderStatus = await OrderStatus.findOne({ where: { order_status: 'pendiente' }, transaction });
                if (!orderStatus) {
                    await transaction.rollback();
                    return res.status(404).json({ message: "El estado de orden 'Pendiente' no existe" });
                }

                // Crear la orden principal
                const order = await Order.create({
                    userId: user.id,
                    adminId: null,
                    orderStatusId: orderStatus.id,
                    total: total,
                    paid: false,
                    payment_option: null,
                }, { transaction });

                // Obtener todos los IDs de productos en el carrito y en cartFree
                const productIds = [...cart, ...cartFree].map(productData => productData.productId);

                // Consultar todos los productos a la vez
                const products = await Product.findAll({ where: { id: productIds }, transaction });

                // Separar productos de cart y cartFree
                const cartProducts = cart.map(productData => ({
                    productData,
                    product: products.find(p => p.id === productData.productId),
                }));

                const cartFreeProducts = cartFree.map(productData => ({
                    productData,
                    product: products.find(p => p.id === productData.productId),
                }));

                // Procesar cart
                const orderItemsPromises = cartProducts.map(async ({ productData, product }) => {
                    if (!product) {
                        await transaction.rollback();
                        return res.status(404).json({ message: `Existe un producto no encontrado: ${product.title}` })
                    }


                    // Restar la cantidad del stock
                    product.stock -= productData.quantity;
                    await product.save({ transaction });

                    // Crear el OrderItem
                    return OrderItem.create({
                        orderId: order.id,
                        productId: productData.productId,
                        quantity: productData.quantity,
                        price_unit: productData.priceUnit
                    }, { transaction });
                });

                // Procesar cartFree
                const cartFreePromises = cartFreeProducts.map(async ({ productData, product }) => {
                    if (!product) {
                        await transaction.rollback();
                        return res.status(404).json({ message: `Existe un producto no encontrado: ${product.title}` })
                    }


                    // Restar la cantidad del stock
                    product.stock -= productData.quantity;
                    await product.save({ transaction });

                    // Crear el OrderItem free
                    return OrderItem.create({
                        orderId: order.id,
                        productId: productData.productId,
                        quantity: productData.quantity,
                        price_unit: 0, // Precio 0 para productos gratuitos
                        free: true // Marcar como gratuito
                    }, { transaction });
                });

                // Ejecutar todas las promesas de OrderItem en paralelo
                await Promise.all([...orderItemsPromises, ...cartFreePromises]);

            });

            // Enviar mensaje al usuario (no dentro de la transacción)
            try {
                if (user && (user.phone_first || user.phone_second)) {
                    const number = user.phone_first || user.phone_second;
                    const cleanedNumber = number.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos
                    const lastNineDigits = cleanedNumber.slice(-9); // Obtener los últimos 9 dígitos

                    const phone = `593${lastNineDigits}`;
                    const message = `Hola ${user.firstName}, este es un mensaje automático generado por una orden de compra. El total de la compra es de $${total}. Por favor, adjunte su comprobante de pago. ¡Gracias por elegir Everchic!
                    
                    *CTA ahorro: 27776464*            
                    🏦 *BANCO GUAYAQUIL*
                    *Cédula:* 0953412020
                    👩🏻 GINA ALVARADO
                    
                    *Correo:* EverChic.sa@gmail.com
                    *CTA ahorro: 2203067894*
                    🏦 *BANCO PICHINCHA*            
                    *Cédula:* 0953412020
                    👩🏻 GINA ALVARADO
                    
                    *Correo:* everchic.sa@gmail.com
                    *CTA ahorro: 1053508041*
                    🏦 *BANCO PACÍFICO*
                    *Cédula: 0953412020*
                    👩🏻 GINA ALVARADO            
                    
                    *Correo:* everchic.sa@gmail.com
                    *CTA ahorro: 20059528697*
                    🏦 *BANCO PRODUBANCO*
                    *Cédula:* 0953412020
                    👩🏻 GINA ALVARADO            
                    *Correo:* everchic.sa@gmail.com
                `;
                    await sendMessageWhatsapp(phone, message)
                }
            } catch (error) {
                console.error('No se ha podido enviar el mensaje:', error);
            }

            return res.status(200).json({ message: 'Orden creada exitosamente' });

        } catch (error) {
            console.error('Error al crear la orden:', error);
            return res.status(500).json({ message: 'Error al procesar la solicitud' });
        }

    } else {
        res.status(400).json({ message: 'Ocurrio un error al procesar el pedido.', result });
    }
});




const getOne = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await Order.findByPk(id);
    if (!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await Order.destroy({ where: { id } });
    if (!result) return res.sendStatus(404);
    return res.sendStatus(204);
});

const update = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await Order.update(
        req.body,
        { where: { id }, returning: true }
    );
    if (result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});

module.exports = {
    getAll,
    getAllOrdersUser,
    create,
    getOne,
    remove,
    update,
    verifyCaptcha

}