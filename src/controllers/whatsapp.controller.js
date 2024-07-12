const catchError = require('../utils/catchError');
const { getQrWhatsapp } = require('../sendOrderWhatsapp');

const getAll = catchError(async(req, res) => {
    try {        
        const data = await getQrWhatsapp();
        
         return res.status(200).send(data);
    } catch (error) {
        return res.status(500).send('Error al obtener el código QR');
    }
});

module.exports = {
    getAll,

}

