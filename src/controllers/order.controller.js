const catchError = require('../utils/catchError');
const Order = require('../models/Order');
const User = require('../models/User');

const OrderItem = require('../models/OrderItem');
const { verify } = require('hcaptcha');
const OrderStatus = require('../models/OrderStatus');
const sequelize = require('../utils/connection');

const { sendMessageWhatsapp } = require('../sendOrderWhatsapp');
const Product = require('../models/Product');
const { validationCart } = require('../utils/validationCart');
const { createUser } = require('../utils/createUser');
const { updateUser } = require('../utils/updateUser');
const verifyJWTcart = require('../utils/VerifyJWTCart');





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
    const { cart, cartFree, token, userCartData, price_unit, total, isPriceShipping } = req.body;
    const result = await validationCart(cart, cartFree, price_unit, total, isPriceShipping);
    
    if (result.cartJoinFiltered.length > 0 || result.failOperation) {
        return res.status(400).json({ message: 'Ocurrió un error al procesar el pedido.', result });
    }

    try {
        const email = userCartData.email;
        let user, newUser = false;

        await sequelize.transaction(async (transaction) => {

            user = await User.findOne({ where: { email }, transaction });
            if (!user) {
                newUser = true;
                user = await createUser(userCartData, { transaction });
                if (!user) {
                    throw new Error('Error al crear el usuario');
                }
            } else {
                if (!user.isVerify) {
                    throw new Error(`Hola ${userCartData.firstName}, debes verificar tu cuenta al correo ${user.email}`);
                }
                if (user.isVerify && !token) {
                    throw new Error('Dispones de una cuenta, debes iniciar sesión por favor');
                }

                if (user.isVerify && token) {                    
                    try {
                        const userId = user.id
                        await verifyJWTcart(token, userId);
                        user = await updateUser(userCartData, user, { transaction });
                    } catch (error) {
                        throw new Error('Tu sesión ha expirado, inicia sesión nuevamente');
                    }
                }
            }



            const orderStatus = await OrderStatus.findOne({ where: { order_status: 'pendiente' }, transaction });
            if (!orderStatus) {
                throw new Error("El estado de orden 'Pendiente' no existe");
            }
            const order = await Order.create({
                userId: user.id,
                adminId: null,
                orderStatusId: orderStatus.id,
                total: total,
                paid: false,
                payment_option: null,
            }, { transaction });


            const productIds = [...cart, ...cartFree].map(productData => productData.productId);
            const products = await Product.findAll({ where: { id: productIds }, transaction });

            await Promise.all([
                ...await processCartItems(cart, products, order.id, { transaction }),
                ...await processCartItems(cartFree, products, order.id, { transaction }, true),
            ]);
        });

        // Enviar mensaje al usuario (fuera de la transacción)
        await sendMessageToUser(userCartData, total);

        const successMessage = `Orden creada exitosamente.${newUser ? ' No olvides verificar tu cuenta' : ''}`;
        return res.status(200).json({ message: successMessage, user });

    } catch (error) {
        console.error('Error al crear la orden:', error.message);
        return res.status(500).json({ message: error.message });
    }
});

const processCartItems = async (cartItems, products, orderId, { transaction }, isFree = false) => {
    return Promise.all(cartItems.map(async (productData) => {
        const product = products.find(p => p.id === productData.productId);
        if (!product) {
            throw new Error(`Existe un producto no encontrado: ${productData.productId}`);
        }
        product.stock -= productData.quantity;
        await product.save({ transaction });

        return OrderItem.create({
            orderId,
            productId: productData.productId,
            quantity: productData.quantity,
            price_unit: isFree ? 0 : productData.priceUnit,
            free: isFree,
        }, { transaction });
    }));
};

const sendMessageToUser = async (userCartData, total) => {
    try {
        if (userCartData.phone_first || userCartData.phone_second) {
            const number = userCartData.phone_first || userCartData.phone_second;
            const cleanedNumber = number.replace(/[^0-9]/g, '').slice(-9);
            const phone = `593${cleanedNumber}`;
            const message = `Hola ${userCartData.firstName}, este es un mensaje automático generado por una orden de compra. El total de la compra es de $${total}. Por favor, adjunte su comprobante de pago. ¡Gracias por elegir Everchic!\n\n
                *CTA ahorro: 27776464*\n
                🏦 *BANCO GUAYAQUIL*\n
                *Cédula:* 0953412020\n
                👩🏻 GINA ALVARADO\n\n
                *Correo:* EverChic.sa@gmail.com\n
                *CTA ahorro: 2203067894*\n
                🏦 *BANCO PICHINCHA*\n
                *Cédula:* 0953412020\n
                👩🏻 GINA ALVARADO\n\n
                *Correo:* everchic.sa@gmail.com\n
                *CTA ahorro: 1053508041*\n
                🏦 *BANCO PACÍFICO*\n
                *Cédula: 0953412020*\n
                👩🏻 GINA ALVARADO\n\n
                *Correo:* everchic.sa@gmail.com\n
                *CTA ahorro: 20059528697*\n
                🏦 *BANCO PRODUBANCO*\n
                *Cédula:* 0953412020\n
                👩🏻 GINA ALVARADO\n
            `;
            //await sendMessageWhatsapp(phone, message);
        }
    } catch (error) {
        console.error('No se ha podido enviar el mensaje:', error);
    }
};



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