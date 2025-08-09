const client = require('prom-client');

// Recopilar métricas por defecto (CPU, memoria, etc.)
client.collectDefaultMetrics();

// Métrica personalizada para duración de requests HTTP
const httpRequestDurationMs = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [50, 100, 200, 300, 500, 1000, 2000, 5000] // buckets en ms
});

// Contador de requests HTTP
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Métrica para conexiones activas a la base de datos
const dbConnectionsActive = new client.Gauge({
  name: 'db_connections_active',
  help: 'Number of active database connections'
});

function metricsMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const delta = Date.now() - start;
    const route = req.route?.path || req.path;
    const method = req.method;
    const statusCode = String(res.statusCode);
    
    // Registrar duración
    httpRequestDurationMs.labels(method, route, statusCode).observe(delta);
    
    // Incrementar contador
    httpRequestsTotal.labels(method, route, statusCode).inc();
  });
  
  next();
}

module.exports = { 
  client, 
  metricsMiddleware,
  dbConnectionsActive
};
