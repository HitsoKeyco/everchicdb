const Product = require("../models/Product");

const validationCart = async (cart, cartFree, price_unit, total, isPriceShipping) => {
    const cartJoin = [];
    let failOperation = false;
    
    const quantityTotalCartFree = cartFree.reduce((acc, product) => acc + product.quantity, 0)
    const quantityTotalCart = cart.reduce((acc, product) => acc + product.quantity, 0);

    const price = Number(((quantityTotalCart * price_unit) + isPriceShipping).toFixed(2));
    //console.log("Cantidad de productos",quantityTotalCart, "Precio unidad", price_unit, "Total", total, "Envio", isPriceShipping );
    

    if (isPriceShipping === 0 || isPriceShipping === undefined || isPriceShipping === null) {
        //console.log('Error en el precio del envio');
        failOperation = true;
    } else if (Number(price) !== Number(total)) {
        failOperation = true;
        //console.log('El calculo del precio y el toal no coincide, Precio', price, "Total", total );
    }

    
    if (quantityTotalCartFree > 0) {        
        const expectedFreeUnits = Math.floor(quantityTotalCart / 12);            
        if (expectedFreeUnits !== quantityTotalCartFree) {
            failOperation = true;
            //console.log('Gratis adulterado');
        }
    }

    cart.forEach(product => {
        cartJoin.push({ productId: product.productId, quantity: product.quantity });
    });

    cartFree.forEach(productFree => {
        const existingProduct = cartJoin.find(p => p.productId === productFree.productId);
        if (existingProduct) {
            existingProduct.quantity += productFree.quantity;
        } else {
            cartJoin.push({ productId: productFree.productId, quantity: productFree.quantity });
        }
    });

    const ids = cartJoin.map(product => product.productId);

    const productsDB = await Product.findAll({
        where: {
            id: ids
        }
    });

    productsDB.forEach(productDB => {
        cartJoin.forEach(productCart => {
            if (productCart.productId === productDB.id) {
                const disponibilityStock = productDB.stock - productCart.quantity;
                productCart.disponibilityStock = disponibilityStock;
                productCart.title = productDB.title;
                productCart.description = productDB.description;
                productCart.stock = productDB.stock;
            }
        });
    });

    const cartJoinFiltered = cartJoin.filter(productCart => productCart.disponibilityStock < 0);

    return { cartJoinFiltered, failOperation };
};

module.exports = {
    validationCart
}