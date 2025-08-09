const express = require('express');
const { validate, Joi } = require('../middleware/validate');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const productService = require('../services/productService');
const logger = require('../config/logger');
const { cacheGet, cacheSet, invalidateProductCache, invalidateProductByIdCache } = require('../cache/cacheMiddleware');

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

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Listar productos con paginación y filtros
 *     description: Obtiene una lista paginada de productos con filtros opcionales por categoría, precio y búsqueda
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 12
 *         description: Productos por página
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Búsqueda por nombre o descripción
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Precio mínimo
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Precio máximo
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
 *         headers:
 *           X-Cache:
 *             description: Indica si la respuesta viene del cache
 *             schema:
 *               type: string
 *               enum: [HIT, MISS]
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductList'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       name: "Camiseta Premium"
 *                       description: "Camiseta de algodón 100% orgánico"
 *                       price: 29.99
 *                       category: "Ropa"
 *                       stock: 100
 *                       image: "https://example.com/image.jpg"
 *                       isActive: true
 *                   pagination:
 *                     page: 1
 *                     limit: 12
 *                     total: 150
 *                     pages: 13
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
// GET /api/products - con cache de 2 minutos
router.get('/', cacheGet, validate(listSchema), async (req, res, next) => {
  try {
    const result = await productService.listProducts(req.query);
    res.json({ success: true, data: result.products, pagination: result.pagination });
  } catch (error) {
    logger.error('Error obteniendo productos', { error: error.message });
    next(error);
  }
}, cacheSet(120));

// GET /api/products/:id - con cache de 5 minutos
router.get('/:id', cacheGet, validate({ params: Joi.object({ id: Joi.string().hex().length(24).required() }) }), async (req, res, next) => {
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
}, cacheSet(300));

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear nuevo producto
 *     description: Crea un nuevo producto. Requiere autenticación y permisos de administrador.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *               - stock
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Camiseta Premium"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Camiseta de algodón 100% orgánico"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 29.99
 *               category:
 *                 type: string
 *                 example: "Ropa"
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 example: 100
 *               image:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/image.jpg"
 *           examples:
 *             newProduct:
 *               value:
 *                 name: "Camiseta Premium"
 *                 description: "Camiseta de algodón 100% orgánico con diseño moderno"
 *                 price: 29.99
 *                 category: "Ropa"
 *                 stock: 100
 *                 image: "https://example.com/camiseta-premium.jpg"
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *             example:
 *               success: true
 *               message: "Producto creado exitosamente"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "Camiseta Premium"
 *                 description: "Camiseta de algodón 100% orgánico"
 *                 price: 29.99
 *                 category: "Ropa"
 *                 stock: 100
 *                 image: "https://example.com/image.jpg"
 *                 isActive: true
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
// POST /api/products
router.post('/', requireAuth, requireAdmin, validate(createSchema), async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    
    // Invalidar cache de productos
    await invalidateProductCache();
    
    res.status(201).json({ success: true, message: 'Producto creado exitosamente', data: product });
  } catch (error) {
    logger.error('Error creando producto', { error: error.message });
    next(error);
  }
});

// GET /api/products/categories/list - con cache de 10 minutos
router.get('/categories/list', cacheGet, async (req, res, next) => {
  try {
    const categories = await productService.listCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    logger.error('Error obteniendo categorías', { error: error.message });
    next(error);
  }
}, cacheSet(600));

// PUT /api/products/:id
router.put('/:id', requireAuth, requireAdmin, validate(updateSchema), async (req, res, next) => {
  try {
    const existing = await productService.getProductById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

    Object.assign(existing, req.body);
    await existing.save();
    
    // Invalidar cache del producto específico y listados
    await invalidateProductByIdCache(req.params.id);
    
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
    
    // Invalidar cache del producto específico y listados
    await invalidateProductByIdCache(req.params.id);
    
    res.json({ success: true, message: 'Producto eliminado' });
  } catch (error) {
    logger.error('Error eliminando producto', { error: error.message });
    next(error);
  }
});

module.exports = router;
