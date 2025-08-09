const express = require('express');
const { validate, Joi } = require('../middleware/validate');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const productService = require('../services/productService');
const logger = require('../config/logger');

const router = express.Router();

// Schemas
const listSchema = {
  query: Joi.object({
    category: Joi.string().optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    search: Joi.string().max(100).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(12),
    sort: Joi.string().valid('createdAt', 'price', 'name').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

const createSchema = {
  body: Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().max(500).required(),
    price: Joi.number().min(0).required(),
    image: Joi.string().uri().required(),
    stock: Joi.number().integer().min(0).required(),
    category: Joi.string().required(),
  }),
};

const idParam = { params: Joi.object({ id: Joi.string().hex().length(24).required() }) };
const updateSchema = {
  ...idParam,
  body: Joi.object({
    name: Joi.string().max(100),
    description: Joi.string().max(500),
    price: Joi.number().min(0),
    image: Joi.string().uri(),
    stock: Joi.number().integer().min(0),
    category: Joi.string(),
  }).min(1),
};

// GET /api/products
router.get('/', validate(listSchema), async (req, res, next) => {
  try {
    const result = await productService.listProducts(req.query);
    res.json({ success: true, data: result.products, pagination: result.pagination });
  } catch (error) {
    logger.error('Error obteniendo productos', { error: error.message });
    next(error);
  }
});

// GET /api/products/:id
router.get('/:id', validate({ params: Joi.object({ id: Joi.string().hex().length(24).required() }) }), async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    logger.error('Error obteniendo producto', { error: error.message });
    next(error);
  }
});

// POST /api/products
router.post('/', requireAuth, requireAdmin, validate(createSchema), async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, message: 'Producto creado exitosamente', data: product });
  } catch (error) {
    logger.error('Error creando producto', { error: error.message });
    next(error);
  }
});

// GET /api/products/categories/list
router.get('/categories/list', async (req, res, next) => {
  try {
    const categories = await productService.listCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    logger.error('Error obteniendo categorías', { error: error.message });
    next(error);
  }
});

// PUT /api/products/:id
router.put('/:id', requireAuth, requireAdmin, validate(updateSchema), async (req, res, next) => {
  try {
    const existing = await productService.getProductById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

    Object.assign(existing, req.body);
    await existing.save();
    res.json({ success: true, message: 'Producto actualizado', data: existing });
  } catch (error) {
    logger.error('Error actualizando producto', { error: error.message });
    next(error);
  }
});

// DELETE /api/products/:id
router.delete('/:id', requireAuth, requireAdmin, validate(idParam), async (req, res, next) => {
  try {
    const existing = await productService.getProductById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

    await existing.deleteOne();
    res.json({ success: true, message: 'Producto eliminado' });
  } catch (error) {
    logger.error('Error eliminando producto', { error: error.message });
    next(error);
  }
});

module.exports = router;
