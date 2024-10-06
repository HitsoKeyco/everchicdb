const Decimal = require('decimal.js');
const Product = require("../models/Product");

const validationCart = async (cart, cartFree, price_unit, total, isPriceShipping) => {
    const cartJoin = [];
    let failOperation = false;

    const quantityTotalCartFree = cartFree.reduce((acc, product) => acc + product.quantity, 0);
    const quantityTotalCart = cart.reduce((acc, product) => acc + product.quantity, 0);
    const priceNew = calculatePriceCart(quantityTotalCart);

    // Usando Decimal para los cálculos de precio
    const price = new Decimal(quantityTotalCart)
        .times(price_unit)
        .plus(isPriceShipping || 0)
        .toDecimalPlaces(2)
        .toNumber();

    //console.log('Cantidad total en el carrito:', quantityTotalCart);
    //console.log('Precio calculado:', price);
    //console.log('Total esperado:', total);

    if (isPriceShipping === 0 || isPriceShipping === undefined || isPriceShipping === null) {
        //console.log('Error en el precio del envío');
        failOperation = true;
    } else if (new Decimal(price).toNumber() !== new Decimal(total).toNumber()) {
        failOperation = true;
        //console.log('El cálculo del precio y el total no coincide. Precio:', price, "Total:", total);
    }

    if (quantityTotalCartFree > 0) {
        const expectedFreeUnits = Math.floor(quantityTotalCart / 12);
        //console.log('Unidades gratis esperadas:', expectedFreeUnits);
        if (expectedFreeUnits !== quantityTotalCartFree) {
            failOperation = true;
            //console.log('Cantidad de productos gratis adulterado. Esperado:', expectedFreeUnits, "Recibido:", quantityTotalCartFree);
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
    //console.log('IDs de productos en el carrito:', ids);

    const productsDB = await Product.findAll({
        where: {
            id: ids
        }
    });

    //console.log('Productos encontrados en la base de datos:', productsDB.map(p => p.id));

    const productDBQuantityFiltered = productsDB.reduce((acc, product) => acc + product.quantity, 0);
    const priceNewTotal = calculatePriceCart(productDBQuantityFiltered);
    const priceNewUnit = new Decimal(priceNewTotal).div(productDBQuantityFiltered).toNumber();
    
    //console.log('Precio total nuevo calculado:', priceNewTotal);
    //console.log('Precio unitario nuevo:', priceNewUnit);

    productsDB.forEach(productDB => {
        cartJoin.forEach(productCart => {
            if (productCart.productId === productDB.id) {
                const disponibilityStock = new Decimal(productDB.stock).minus(productCart.quantity).toNumber();
                productCart.disponibilityStock = disponibilityStock;
                productCart.quantity = Math.min(productCart.quantity, productDB.stock); // Ajustar la cantidad al stock disponible
                productCart.title = productDB.title;
                productCart.description = productDB.description;
                productCart.stock = productDB.stock;
                productCart.price_unit = priceNew;                
            }
        });
    });

    const cartJoinFiltered = cartJoin.filter(productCart => productCart.disponibilityStock < 0);
    
    //console.log('Carrito filtrado:', cartJoinFiltered);
    //console.log('Operación fallida:', failOperation);

    return { cartJoinFiltered, failOperation };
};

const calculatePriceCart = (quantityProductCart) => {
    if (quantityProductCart < 3) {
        return new Decimal(quantityProductCart).times(5).toNumber();
    } else if (quantityProductCart >= 3 && quantityProductCart < 6) {
        return new Decimal(quantityProductCart).times(new Decimal(13).div(3)).toNumber();
    } else if (quantityProductCart >= 6 && quantityProductCart < 12) {
        return new Decimal(quantityProductCart).times(new Decimal(20).div(6)).toNumber();
    } else if (quantityProductCart >= 12 && quantityProductCart < 60) {
        return new Decimal(quantityProductCart).times(new Decimal(36).div(12)).toNumber();
    } else if (quantityProductCart >= 60) {
        return new Decimal(quantityProductCart).times(new Decimal(165).div(60)).toNumber();
    }
    return 0; // Retornar 0 si no se cumplen las condiciones
};

module.exports = {
    validationCart
};
