const Admin = require("./Admin");
const Cart = require("./Cart");
const Category = require("./Category");
const CategoryExpense = require("./CategoryExpense");
const ChatMessage = require("./ChatMessage");
const Collection = require("./Collection");
const Contact = require("./Contact");
const Credit = require("./Credit");
const Expense = require("./Expense");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const OrderStatus = require("./OrderStatus");
const Product = require("./Product");
const ProductImg = require("./ProductImg");
const ProductTag = require("./ProductTag");
const Purchase = require("./Purchase");
const Rol = require("./Rol");
const Size = require("./Size");
const Supplier = require("./Supplier");
const Tag = require("./Tag");
const User = require("./User");
const ProductLike = require("./ProductLike");


//1 producto "pertenece a" 1 categoria
Product.belongsTo(Category) // categoryId
//1 categoria "puede tener muchos"  productos
Category.hasMany(Product)


//Cart -> userId
Cart.belongsTo(User)
User.hasMany(Cart)

//Cart -> productId
Cart.belongsTo(Product)
Product.hasMany(Cart)

//Purchase -> userId
Purchase.belongsTo(User)
User.hasMany(Purchase)

//Purchase -> productId
Purchase.belongsTo(Product)
Product.hasMany(Purchase)

//ProductImg -> ProductId
ProductImg.belongsTo(Product)
Product.hasMany(ProductImg)

//Admin -> rolId}
Admin.belongsTo(Rol)
Rol.hasOne(Admin)

//Contact -> rolId
Contact.belongsTo(Rol)
Rol.hasOne(Contact)

// Product -> collectionId
Product.belongsTo(Collection);
Collection.hasMany(Product, { foreignKey: 'collectionId', constraints: false });

// Proveedor -> Productos
Supplier.hasMany(Product);
Product.belongsTo(Supplier);

// Expense -> CategoryExpenses
Expense.belongsTo(CategoryExpense);
CategoryExpense.hasMany(Expense);

// Expense -> Supplier
Expense.belongsTo(Supplier);
Supplier.hasMany(Expense);

//Expense -> Credit
Expense.hasMany(Credit);
Credit.hasOne(Expense)

//Product -> Size
Product.belongsTo(Size)
Size.hasMany(Product)

//Tags -> Product
Product.belongsToMany(Tag, { through: ProductTag });
Tag.belongsToMany(Product, { through: ProductTag });

// Un mensaje pertenece a un cliente
ChatMessage.belongsTo(User);
// Un cliente puede tener muchos mensajes
User.hasMany(ChatMessage);

//Order -> OrderStatus
Order.belongsTo(OrderStatus)
OrderStatus.hasMany(Order)

//Order -> User
Order.belongsTo(User)
User.hasMany(Order)

// Order -> Admin
Order.belongsTo(Admin)
Admin.hasMany(Order)

// Order -> OrderItem
Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

//OrderItem -> Product
OrderItem.belongsTo(Product)
Product.hasMany(OrderItem)

//UserProductLike -> Product
User.belongsToMany(Product, { through: ProductLike })
Product.belongsToMany(User, { through: ProductLike })


