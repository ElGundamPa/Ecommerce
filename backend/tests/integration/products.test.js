const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const Product = require('../../models/Product');

describe('Products routes', () => {
  let adminToken;
  beforeAll(async () => {
    await Product.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('lists products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});







