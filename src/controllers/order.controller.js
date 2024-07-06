const catchError = require('../utils/catchError');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const OrderItem = require('../models/OrderItem');
const { sendMessage } = require('../serverWhatsapp');
const { verify } = require('hcaptcha');
const OrderStatus = require('../models/OrderStatus');
const sequelize = require('../utils/connection');
const { createUser } = require('../utils/createUser');
const { sendMessageWhatsapp } = require('../sendOrderWhatsapp');


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


// Tu función de creación

const create = catchError(async (req, res) => {
    const { userActive, cart, cartFree, total } = req.body;
    
    let user;
    
    try {
        await sequelize.transaction(async (transaction) => {
            user = await User.findOne({ where: { email: userActive.email }, transaction });

            if (user) {
                await User.update(userActive, { where: { id: user.id }, transaction });
            } else {
                user = await createUser(userActive)
            }

            const orderStatus = await OrderStatus.findOne({ where: { order_status: 'pendiente' }, transaction });
            if (!orderStatus) {
                throw new Error("El estado de orden 'pendiente' no existe");
            }

            const order = await Order.create({
                userId: user.id,
                adminId: null,
                orderStatusId: orderStatus.id,
                total: total,
                paid: false
            }, { transaction });

            const orderItemsPromises = cart.map(async productData => {
                const product = await Product.findByPk(productData.productId, { transaction });
                if (product) {
                    return OrderItem.create({
                        orderId: order.id,
                        productId: productData.productId,
                        quantity: productData.quantity,
                        price_unit: productData.priceUnit
                    }, { transaction });
                }
            });

            const cartFreePromises = cartFree.map(async productData => {
                const product = await Product.findByPk(productData.productId, { transaction });
                if (product) {
                    return OrderItem.create({
                        orderId: order.id,
                        productId: productData.productId,
                        quantity: productData.quantity,
                        price_unit: 0,
                        free: true
                    }, { transaction });
                }
            });

            await Promise.all([...orderItemsPromises, ...cartFreePromises]);
        });

        // Enviar mensaje al usuario (no dentro de la transacción)
        try {
            if (user.phone_first || user.phone_second) {
                
                const number = user.phone_first || user.phone_second;
                const cleanedNumber = number.replace(/[^0-9]/g, ''); // Elimina cualquier caracter no numérico
                const lastNineDigits = cleanedNumber.slice(-9); // Obtiene los últimos 9 dígitos

                const phone = `593${lastNineDigits}`;                
                const message = `Hola Sergio, este es un mensaje automático generado por una orden de compra. El total de la compra es de $${total}. Por favor, adjunte su comprobante de pago. ¡Gracias por elegir Everchic!
                

🏦 *BANCO GUAYAQUIL*
*CTA ahorro: 27776464*            
👩🏻 GINA ALVARADO
*Cédula:* 0953412020
*Correo:* EverChic.sa@gmail.com

🏦 *BANCO PICHINCHA*            
*CTA ahorro: 2203067894*
👩🏻 GINA ALVARADO
*Cédula:* 0953412020
*Correo:* everchic.sa@gmail.com

🏦 *BANCO PACÍFICO*
*CTA ahorro: 1053508041*
👩🏻 GINA ALVARADO            
*Cédula: 0953412020*
*Correo:* everchic.sa@gmail.com

🏦 *BANCO PRODUBANCO*
*CTA ahorro: 20059528697*
👩🏻 GINA ALVARADO            
*Cédula:* 0953412020
*Correo:* everchic.sa@gmail.com
`;
                // await sendMessage(phone, message);                
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