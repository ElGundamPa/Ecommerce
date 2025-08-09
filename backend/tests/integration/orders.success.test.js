const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const Product = require('../../models/Product');

describe('Orders with CSRF token', () => {
  beforeAll(async () => {
    await Product.deleteMany({});
    await Product.create({
      name: 'CSRF Item',
      description: 'desc',
      price: 20,
      image: 'https://example.com/i.jpg',
      stock: 3,
      category: 'Otros',
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('creates order when CSRF token provided', async () => {
    const agent = request.agent(app);
    // fetch token
    const tokenRes = await agent.get('/api/csrf-token');
    const csrfToken = tokenRes.body.csrfToken;

    const prod = await Product.findOne({ name: 'CSRF Item' });
    const res = await agent
      .post('/api/orders')
      .set('csrf-token', csrfToken)
      .send({
        customerName: 'John',
        customerEmail: 'john@example.com',
        customerAddress: 'Street 1',
        items: [{ product: prod._id.toString(), quantity: 1 }],
        total: 20,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toBeDefined();
  });
});





