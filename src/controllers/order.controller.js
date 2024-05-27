const catchError = require('../utils/catchError');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const OrderItem = require('../models/OrderItem');
const { sendMessage } = require('../serverWhatsapp');
const { verify } = require('hcaptcha');
const OrderStatus = require('../models/OrderStatus');

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
    const SECRET_KEY = "ES_b968e2c005bc48e890670989c9b87eab"; // clave secreta de hCaptcha
    const RESPONSE_TOKEN = tokenCaptcha; // Utilizamos el token recibido en la solicitud

    try {
        const data = await verify(SECRET_KEY, RESPONSE_TOKEN);

        if (data.success) {
            // El captcha es válido, puedes proceder con tu lógica aquí
            res.status(200).json({ message: 'Captcha válido. Formulario procesado correctamente.' });
        } else {
            // El captcha no es válido
            res.status(400).json({ message: 'Error: Captcha inválido.' });
        }
    } catch (error) {
        console.error('Error al verificar el captcha:', error);
        res.status(500).json({ message: 'Error al procesar la solicitud.' });
    }
};




const create = catchError(async (req, res) => {
        const userData = req.body;        
    try {

        let user = await User.findOne({ where: { email: userData.email } });

        if (!user) {
            user = await User.create(userData);
        }

        const orderStatus = await OrderStatus.findOne({ where: { order_status: 'pendiente' } });
        if (!orderStatus) {
            throw new Error("El estado de orden 'pendiente' no existe");
        }

        const order = await Order.create({
            userId: user.id,
            adminId: null,
            orderStatusId: orderStatus.id,
            total: userData.total,
            paid: false
        });

        for (const productData of userData.cart) {
            const product = await Product.findByPk(productData.productId);
            if (product) {
                await OrderItem.create({
                    orderId: order.id,
                    productId: productData.productId,
                    quantity: productData.quantity,
                    price_unit: productData.priceUnit
                });
            }
        }

        if (userData.cartFree.length > 0) {
            for (const productData of userData.cartFree) {
                const product = await Product.findByPk(productData.productId);
                if (product) {
                    await OrderItem.create({
                        orderId: order.id,
                        productId: productData.productId,
                        quantity: productData.quantity,
                        price_unit: 0,
                        free: true
                    });
                }
            }
        }

        // Enviar mensaje
        try {
            const number = user.phone_first
            const cleanedNumber = number.slice(1);
            const phone = `593${cleanedNumber}@c.us`
            const message = `Hola ${userData.firstName}, este es un mensaje automático generado por una orden de compra. El total de la compra es de $${userData.total}. Por favor, adjunte su comprobante de pago. ¡Gracias por elegir Everchic!
            
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


            await sendMessage(phone, message);
            console.log('Mensaje enviado');
        } catch (error) {
            console.log('No se ha podido enviar el mensaje');
        }
        // Paso 4: Retornar respuesta exitosa
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