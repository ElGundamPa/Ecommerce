const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');

const router = express.Router();

// GET /api/products - Obtener todos los productos con paginación
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      search, 
      page = 1, 
      limit = 12, 
      sort = 'createdAt',
      order = 'desc'
    } = req.query;
    
    let query = {};
    
    // Filtro por categoría
    if (category) {
      query.category = category;
    }
    
    // Filtro por precio
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Búsqueda por texto
    if (search) {
      query.$text = { $search: search };
    }
    
    // Configuración de paginación
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Configuración de ordenamiento
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sort]: sortOrder };
    
    // Ejecutar consulta con paginación
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query)
    ]);
    
    // Calcular información de paginación
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;
    
    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? pageNum + 1 : null,
        prevPage: hasPrevPage ? pageNum - 1 : null
      }
    });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/products/:id - Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'ID de producto inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/products - Crear nuevo producto (para administración)
router.post('/', [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('El nombre es requerido y debe tener máximo 100 caracteres'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('La descripción es requerida y debe tener máximo 500 caracteres'),
  body('price').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('image').trim().isURL().withMessage('La imagen debe ser una URL válida'),
  body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo'),
  body('category').isIn(['Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Otros']).withMessage('Categoría inválida')
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
    
    const product = new Product(req.body);
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: product
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/products/categories - Obtener categorías disponibles
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;
