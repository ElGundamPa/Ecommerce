const request = require('supertest');
const app = require('../server');

describe('Health Check Endpoint', () => {
  test('GET /api/health should return health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('db');
    expect(response.body).toHaveProperty('time');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('environment');
    expect(response.body).toHaveProperty('correlationId');
    
    expect(response.body.status).toBe('ok');
    expect(typeof response.body.uptime).toBe('number');
    expect(typeof response.body.correlationId).toBe('string');
  });

  test('GET /api/health should include cache status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('redis');
    expect(response.body).toHaveProperty('cache');
    
    // Redis puede estar habilitado o deshabilitado
    expect(['ok', 'disabled']).toContain(response.body.redis);
    expect(['enabled', 'disabled']).toContain(response.body.cache);
  });

  test('GET /api/health should have correlation ID header', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.headers).toHaveProperty('x-correlation-id');
    expect(response.headers['x-correlation-id']).toBeTruthy();
  });
});

describe('Metrics Endpoint', () => {
  test('GET /metrics should return Prometheus metrics', async () => {
    const response = await request(app)
      .get('/metrics')
      .expect(200);

    expect(response.headers['content-type']).toContain('text/plain');
    expect(response.text).toContain('# HELP');
    expect(response.text).toContain('# TYPE');
  });

  test('GET /metrics should include custom metrics', async () => {
    const response = await request(app)
      .get('/metrics')
      .expect(200);

    // Verificar que incluye métricas personalizadas
    expect(response.text).toContain('http_request_duration_ms');
    expect(response.text).toContain('http_requests_total');
  });
});
