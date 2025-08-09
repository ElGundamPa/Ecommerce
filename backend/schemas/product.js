const Joi = require('joi');

const createProduct = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  description: Joi.string().max(2000).allow(''),
  price: Joi.number().min(0).required(),
  category: Joi.string().max(60).required(),
  stock: Joi.number().integer().min(0).default(0),
  image: Joi.string().uri().optional(),
  tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
  isActive: Joi.boolean().default(true)
});

const updateProduct = Joi.object({
  name: Joi.string().min(2).max(120).optional(),
  description: Joi.string().max(2000).allow('').optional(),
  price: Joi.number().min(0).optional(),
  category: Joi.string().max(60).optional(),
  stock: Joi.number().integer().min(0).optional(),
  image: Joi.string().uri().optional(),
  tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
  isActive: Joi.boolean().optional()
});

const productQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  category: Joi.string().max(60).optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  search: Joi.string().max(100).optional(),
  sortBy: Joi.string().valid('name', 'price', 'createdAt', 'stock').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createProduct,
  updateProduct,
  productQuery
};
