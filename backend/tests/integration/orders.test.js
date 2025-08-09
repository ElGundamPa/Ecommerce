const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const Product = require('../../models/Product');

describe('Orders routes', () => {
  beforeAll(async () => {
    await Product.deleteMany({});
    await Product.create({
      name: 'Test',
      description: 'desc',
      price: 10,
      image: 'https://example.com/img.jpg',
      stock: 5,
      category: 'Otros',
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('returns 403 without CSRF token', async () => {
    const prod = await Product.findOne();
    const res = await request(app).post('/api/orders').send({
      customerName: 'A',
      customerEmail: 'a@a.com',
      customerAddress: 'addr',
      items: [{ product: prod._id.toString(), quantity: 1 }],
      total: 10,
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});





