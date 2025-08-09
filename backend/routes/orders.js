const express = require('express');
const { validate, Joi } = require('../middleware/validate');
const orderService = require('../services/orderService');
const logger = require('../config/logger');

const router = express.Router();

const createOrderSchema = {
  body: Joi.object({
    customerName: Joi.string().max(100).required(),
    customerEmail: Joi.string().email().required(),
    customerAddress: Joi.string().max(200).required(),
    items: Joi.array()
      .items(
        Joi.object({
          product: Joi.string().hex().length(24).required(),
          quantity: Joi.number().integer().min(1).required(),
        })
      )
      .min(1)
      .required(),
    total: Joi.number().min(0).required(),
  }),
};

// POST /api/orders
router.post('/', validate(createOrderSchema), async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.body);
    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: {
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    logger.error('Error creando pedido', { error: error.message });
    next(error);
  }
});

// GET /api/orders/:orderNumber
router.get('/:orderNumber', validate({ params: Joi.object({ orderNumber: Joi.string().required() }) }), async (req, res, next) => {
  try {
    const order = await orderService.getOrderByNumber(req.params.orderNumber);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    logger.error('Error obteniendo pedido', { error: error.message });
    next(error);
  }
});

// GET /api/orders
router.get('/', validate({ query: Joi.object({ email: Joi.string().email().required() }) }), async (req, res, next) => {
  try {
    const orders = await orderService.getOrdersByEmail(req.query.email);
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    logger.error('Error obteniendo pedidos', { error: error.message });
    next(error);
  }
});

module.exports = router;
