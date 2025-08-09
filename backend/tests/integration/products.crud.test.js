const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Product = require('../../models/Product');

describe('Products CRUD (protected)', () => {
  let adminToken;

  beforeAll(async () => {
    await Product.deleteMany({});
    await User.deleteMany({});
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'Password123',
      role: 'admin',
    });
    adminToken = jwt.sign({ id: admin._id, email: admin.email, role: 'admin' }, process.env.JWT_SECRET || 'test-secret-key');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('rejects creating product without auth', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'P', description: 'D', price: 10, image: 'https://x.com/i.jpg', stock: 1, category: 'Otros',
    });
    expect(res.status).toBe(401);
  });

  it('creates product with admin token', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Phone', description: 'Nice', price: 499, image: 'https://ex.com/p.jpg', stock: 10, category: 'Otros' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('updates a product', async () => {
    const prod = await Product.findOne({ name: 'Phone' });
    const res = await request(app)
      .put(`/api/products/${prod._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 399 });
    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(399);
  });

  it('deletes a product', async () => {
    const prod = await Product.findOne({ name: 'Phone' });
    const res = await request(app)
      .delete(`/api/products/${prod._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});





