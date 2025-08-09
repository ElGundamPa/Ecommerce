const Joi = require('joi');

const orderItem = Joi.object({
  product: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(), // ObjectId
  quantity: Joi.number().integer().min(1).max(100).required(),
  price: Joi.number().min(0).required()
});

const createOrder = Joi.object({
  items: Joi.array().items(orderItem).min(1).max(50).required(),
  shippingAddress: Joi.object({
    street: Joi.string().max(200).required(),
    city: Joi.string().max(100).required(),
    state: Joi.string().max(100).required(),
    zipCode: Joi.string().max(20).required(),
    country: Joi.string().max(100).required()
  }).required(),
  paymentMethod: Joi.string().valid('credit_card', 'debit_card', 'paypal', 'bank_transfer').required(),
  notes: Joi.string().max(500).allow('').optional()
});

const updateOrderStatus = Joi.object({
  status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required(),
  trackingNumber: Joi.string().max(100).optional(),
  notes: Joi.string().max(500).allow('').optional()
});

const orderQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').optional(),
  userId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'total').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createOrder,
  updateOrderStatus,
  orderQuery
};
