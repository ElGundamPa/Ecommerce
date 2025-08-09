const Product = require('../models/Product');

async function listProducts(filters) {
  const {
    category,
    minPrice,
    maxPrice,
    search,
    page = 1,
    limit = 12,
    sort = 'createdAt',
    order = 'desc',
  } = filters;

  const query = {};
  if (category) query.category = category;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }
  if (search) {
    query.$text = { $search: search };
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  const sortOrder = order === 'asc' ? 1 : -1;
  const sortObj = { [sort]: sortOrder };

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
    Product.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return {
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
      nextPage: pageNum < totalPages ? pageNum + 1 : null,
      prevPage: pageNum > 1 ? pageNum - 1 : null,
    },
  };
}

async function getProductById(id) {
  return Product.findById(id);
}

async function createProduct(payload) {
  const product = new Product(payload);
  await product.save();
  return product;
}

async function listCategories() {
  return Product.distinct('category');
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  listCategories,
};

