const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');

const router = express.Router();

// POST /api/orders - Crear nuevo pedido
router.post('/', [
  body('customerName').trim().isLength({ min: 1, max: 100 }).withMessage('El nombre del cliente es requerido y debe tener máximo 100 caracteres'),
  body('customerEmail').trim().isEmail().withMessage('El email del cliente debe ser válido'),
  body('customerAddress').trim().isLength({ min: 1, max: 200 }).withMessage('La dirección del cliente es requerida y debe tener máximo 200 caracteres'),
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
  body('items.*.product').isMongoId().withMessage('ID de producto inválido'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
  body('total').isFloat({ min: 0 }).withMessage('El total debe ser un número positivo')
], async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { customerName, customerEmail, customerAddress, items, total } = req.body;

    // Verificar que todos los productos existan y tengan stock suficiente
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Producto con ID ${item.product} no encontrado`
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`
        });
      }
      
      // Agregar información del producto al item del pedido
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    // Crear el pedido
    const order = new Order({
      customerName,
      customerEmail,
      customerAddress,
      items: orderItems,
      total
    });

    await order.save();

    // Actualizar stock de productos
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: {
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('Error creando pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/orders/:orderNumber - Obtener pedido por número
router.get('/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('items.product', 'name description price image');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/orders - Obtener pedidos por email (para clientes)
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El email es requerido para buscar pedidos'
      });
    }
    
    const orders = await Order.find({ customerEmail: email })
      .populate('items.product', 'name description price image')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;
