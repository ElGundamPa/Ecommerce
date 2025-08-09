const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const User = require('../../models/User');

describe('Auth routes', () => {
  beforeAll(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('registers a user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('logs in a user and returns JWT', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'Password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.data?.token || res.body.token).toBeDefined();
  });
});



