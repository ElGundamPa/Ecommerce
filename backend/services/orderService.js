const Order = require('../models/Order');
const Product = require('../models/Product');

async function createOrder({ customerName, customerEmail, customerAddress, items, total }) {
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      const error = new Error(`Producto con ID ${item.product} no encontrado`);
      error.statusCode = 404;
      throw error;
    }

    if (product.stock < item.quantity) {
      const error = new Error(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`);
      error.statusCode = 400;
      throw error;
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.image,
    });
  }

  const order = new Order({
    customerName,
    customerEmail,
    customerAddress,
    items: orderItems,
    total,
  });

  await order.save();

  // Update stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  return order;
}

async function getOrderByNumber(orderNumber) {
  return Order.findOne({ orderNumber }).populate('items.product', 'name description price image');
}

async function getOrdersByEmail(email) {
  return Order.find({ customerEmail: email })
    .populate('items.product', 'name description price image')
    .sort({ createdAt: -1 });
}

module.exports = { createOrder, getOrderByNumber, getOrdersByEmail };

