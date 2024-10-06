const catchError = require('../utils/catchError');
const { getQrWhatsapp, closeConectionWhatsapp } = require('../sendOrderWhatsapp');

const getAll = catchError(async(req, res) => {
    try {
        console.log('pidiendo qr de whatsapp');
                
        const data = await getQrWhatsapp();        
         return res.status(200).send({ status: true, data: data});
    } catch (error) {
        return res.status(500).send({ status: false, data: null });
    }
});

const closeSession = catchError(async(req, res) => {
    console.log('Backend llamando a closeConectionWhatsapp ');
    
    try {
        const data = await closeConectionWhatsapp();
        return res.status(200).send({ status: true, data: data});
    } catch (error) {
        return res.status(500).send({ status: false, data: null})
        
    }
})

module.exports = {
    getAll,
    closeSession
}

