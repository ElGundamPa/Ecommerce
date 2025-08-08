const request = require('supertest');
const app = require('../../server');
const Product = require('../../models/Product');

describe('Product Routes', () => {
  let testProduct;

  beforeEach(async () => {
    // Crear producto de prueba
    testProduct = new Product({
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      image: 'https://example.com/image.jpg',
      stock: 10,
      category: 'Electrónicos'
    });
    await testProduct.save();
  });

  describe('GET /api/products', () => {
    test('debe obtener todos los productos', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
    });

    test('debe filtrar por categoría', async () => {
      const response = await request(app)
        .get('/api/products?category=Electrónicos')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(p => p.category === 'Electrónicos')).toBe(true);
    });

    test('debe filtrar por precio', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=50&maxPrice=150')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(p => p.price >= 50 && p.price <= 150)).toBe(true);
    });

    test('debe paginar resultados', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/products/:id', () => {
    test('debe obtener un producto por ID', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testProduct._id.toString());
      expect(response.body.data.name).toBe(testProduct.name);
    });

    test('debe devolver 404 para ID inválido', async () => {
      const response = await request(app)
        .get('/api/products/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Producto no encontrado');
    });

    test('debe devolver 400 para ID malformado', async () => {
      const response = await request(app)
        .get('/api/products/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('ID de producto inválido');
    });
  });

  describe('POST /api/products', () => {
    test('debe crear un nuevo producto con datos válidos', async () => {
      const newProduct = {
        name: 'New Product',
        description: 'New Description',
        price: 149.99,
        image: 'https://example.com/new-image.jpg',
        stock: 20,
        category: 'Ropa'
      };

      const response = await request(app)
        .post('/api/products')
        .send(newProduct)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newProduct.name);
      expect(response.body.data.price).toBe(newProduct.price);
    });

    test('debe validar datos requeridos', async () => {
      const invalidProduct = {
        name: '',
        price: -10
      };

      const response = await request(app)
        .post('/api/products')
        .send(invalidProduct)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/products/categories/list', () => {
    test('debe obtener lista de categorías', async () => {
      const response = await request(app)
        .get('/api/products/categories/list')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toContain('Electrónicos');
    });
  });
});
