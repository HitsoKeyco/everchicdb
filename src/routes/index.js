const express = require('express');
const { verifyJWT } = require('../utils/VerifyJWT');

const routerUser = require("./user.router");
const routerCategory = require('./category.router');
const routerProduct = require('./product.router');
const routerCart = require('./cart.router');
const routerPurchase = require('./purchase.router');
const routerProductImg = require('./productImg.router');
const routerRol = require('./rol.router');
const routerCustomer = require('./customer.route');
const routerTag = require('./tag.router');
const routerSupplier = require('./supplier.router');
const routerSize = require('./size.router');
const routerExpense = require('./expense.router');
const routerCategoryExpense = require('./categoryExpense.router');
const routerBank = require('./bank.router');
const routerCredit = require('./credit.router');
const routerContact = require('./contact.router');
const routerCollection = require('./collection.router');
const routerAdmin = require('./admin.router');
const routerChatMessage = require('./chatMessage.route');
const routerOrder = require('./order.router');
const routerOrderStatus = require('./orderStatus.router');
const routerOrderItem = require('./OrderItem.router');
const router = express.Router();


router.use("/users", routerUser)    
router.use("/admin", routerAdmin)   
router.use("/categories", routerCategory)
router.use("/products", routerProduct)
router.use("/product_images", routerProductImg)
router.use("/collections", routerCollection)
router.use("/message", routerChatMessage)

router.use("/orders", routerOrder)
router.use("/orders_status", routerOrderStatus)
router.use("/orders_items", routerOrderItem)
router.use("/cart", verifyJWT,routerCart) //🔒
router.use("/roles", verifyJWT,routerRol) //🔒
router.use("/contacts", verifyJWT,routerContact) //🔒
router.use("/purchase", verifyJWT, routerPurchase) //🔒
router.use("/customers", verifyJWT, routerCustomer) //🔒
router.use("/tags", verifyJWT, routerTag) //🔒
router.use("/suppliers", verifyJWT, routerSupplier) //🔒
router.use("/sizes", verifyJWT, routerSize) //🔒
router.use("/expenses", verifyJWT, routerExpense) //🔒
router.use("/categories_expenses", verifyJWT, routerCategoryExpense) //🔒
router.use("/bank", verifyJWT, routerBank) //🔒
router.use("/credits", verifyJWT, routerCredit) //🔒




module.exports = router;