# Operación & Observabilidad

Este documento describe las funcionalidades operacionales y de monitoreo implementadas en el proyecto ecommerce.

## 🏥 Health Check

### Endpoint: `/api/health`

Verifica el estado de salud del servicio y sus dependencias.

**Respuesta exitosa (200):**
```json
{
  "status": "ok",
  "db": "ok",
  "redis": "ok",
  "cache": "enabled",
  "time": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "environment": "development",
  "correlationId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Respuesta con error (500):**
```json
{
  "status": "error",
  "db": "down",
  "redis": "unknown",
  "cache": "disabled",
  "error": "Connection timeout",
  "time": "2024-01-15T10:30:00.000Z",
  "correlationId": "123e4567-e89b-12d3-a456-426614174000"
}
```

### Estados posibles:
- **db**: `ok` | `down`
- **redis**: `ok` | `disabled` | `unknown`
- **cache**: `enabled` | `disabled`

## 📊 Métricas Prometheus

### Endpoint: `/metrics`

Expone métricas en formato Prometheus para monitoreo.

### Métricas disponibles:

#### Métricas HTTP
- `http_request_duration_ms`: Duración de requests HTTP (histogram)
- `http_requests_total`: Total de requests HTTP (counter)
- `db_connections_active`: Conexiones activas a la base de datos (gauge)

#### Métricas del sistema (por defecto)
- `process_cpu_user_seconds_total`: Tiempo de CPU en modo usuario
- `process_cpu_system_seconds_total`: Tiempo de CPU en modo sistema
- `process_resident_memory_bytes`: Memoria residente del proceso
- `nodejs_heap_size_total_bytes`: Tamaño total del heap de Node.js
- `nodejs_heap_size_used_bytes`: Heap usado de Node.js

### Ejemplo de salida:
```
# HELP http_request_duration_ms HTTP request duration in milliseconds
# TYPE http_request_duration_ms histogram
http_request_duration_ms_bucket{method="GET",route="/api/products",status_code="200",le="50"} 10
http_request_duration_ms_bucket{method="GET",route="/api/products",status_code="200",le="100"} 25
http_request_duration_ms_count{method="GET",route="/api/products",status_code="200"} 100
http_request_duration_ms_sum{method="GET",route="/api/products",status_code="200"} 5000
```

## 🔍 Trazabilidad

### Correlation ID

Cada request recibe un Correlation ID único para facilitar el debugging y trazabilidad.

**Headers:**
- Request: `x-correlation-id` (opcional, se genera uno si no se proporciona)
- Response: `x-correlation-id` (siempre presente)

**Ejemplo:**
```bash
curl -H "x-correlation-id: my-trace-123" http://localhost:5000/api/health
```

## 🛡️ Rate Limiting

### Límites configurados:

| Endpoint | Ventana | Límite | Descripción |
|----------|---------|--------|-------------|
| Global | 15 min | 100 requests | Límite general para toda la API |
| `/api/auth/login` | 15 min | 20 requests | Intentos de login |
| `/api/orders` | 15 min | 50 requests | Operaciones de pedidos |

### Respuesta cuando se excede el límite (429):
```json
{
  "success": false,
  "message": "Demasiadas solicitudes. Intenta en 15 minutos."
}
```

### Headers de rate limit:
- `X-RateLimit-Limit`: Límite máximo
- `X-RateLimit-Remaining`: Requests restantes
- `X-RateLimit-Reset`: Timestamp de reset

## 🗄️ Cache Redis (Opcional)

### Configuración

El cache Redis es completamente opcional y se deshabilita automáticamente si no está configurado.

**Variable de entorno:**
```bash
REDIS_URL=redis://localhost:6379
```

### Estrategias de cache:

| Endpoint | Estrategia | TTL | Invalidación |
|----------|------------|-----|--------------|
| `GET /api/products` | Network First | 2 min | Al crear/editar/eliminar productos |
| `GET /api/products/:id` | Network First | 5 min | Al editar/eliminar producto específico |
| `GET /api/products/categories/list` | Network First | 10 min | Al crear productos con nueva categoría |

### Headers de cache:
- `X-Cache`: `HIT` | `MISS`
- `x-served-from`: `cache` (cuando viene del cache offline)

## 🔧 Variables de Entorno

### Requeridas:
```bash
NODE_ENV=development|production|test
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=change_me_please_min_32_chars________________
FRONTEND_URL=http://localhost:3000
```

### Opcionales:
```bash
PORT=5000
REDIS_URL=redis://localhost:6379
CSP_CONNECT_EXTRA=https://api.external.com
```

### Validación

Todas las variables se validan al inicio de la aplicación usando Joi. Si alguna variable requerida falta o es inválida, la aplicación no iniciará.

## 📱 PWA y Service Worker

### Estrategias de cache:

| Tipo de recurso | Estrategia | TTL |
|----------------|------------|-----|
| API calls | Network First | 5 min |
| Assets estáticos | Cache First | 7 días |
| Imágenes | Cache First | 24 horas |
| Otros recursos | Stale While Revalidate | - |

### URLs excluidas del cache:
- `/api/auth/login`
- `/api/orders`
- `/api/health`
- `/metrics`

### Página offline:
- Disponible en `/offline.html`
- Verificación automática de conexión cada 30 segundos
- Notificaciones cuando se restaura la conexión

## 🚨 Monitoreo y Alertas

### Dashboards recomendados (Grafana):

1. **API Performance**
   - Request rate (`rate(http_requests_total[5m])`)
   - Response time percentiles (`histogram_quantile(0.95, http_request_duration_ms)`)
   - Error rate (`rate(http_requests_total{status_code!~"2.."}[5m])`)

2. **System Health**
   - Memory usage (`process_resident_memory_bytes`)
   - CPU usage (`rate(process_cpu_user_seconds_total[5m])`)
   - Database connections (`db_connections_active`)

3. **Cache Performance**
   - Cache hit rate (custom metric desde Redis)
   - Cache size (custom metric desde Redis)

### Alertas sugeridas:

```yaml
# Prometheus AlertManager
groups:
  - name: ecommerce-api
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code!~"2.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          
      - alert: DatabaseDown
        expr: up{job="ecommerce-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection lost"
          
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_ms) > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
```

## 🔍 Debugging

### Logs estructurados

Todos los logs incluyen el Correlation ID para facilitar el debugging:

```json
{
  "level": "info",
  "message": "Request processed",
  "correlationId": "123e4567-e89b-12d3-a456-426614174000",
  "method": "GET",
  "url": "/api/products",
  "statusCode": 200,
  "duration": 150,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Headers útiles para debugging:

- `x-correlation-id`: Para rastrear requests
- `x-cache`: Para verificar comportamiento del cache
- `x-served-from`: Para identificar origen de la respuesta

## 🛠️ Troubleshooting

### Problemas comunes:

1. **Cache no funciona**
   - Verificar `REDIS_URL` en variables de entorno
   - Comprobar conectividad a Redis
   - Revisar logs de Service Worker

2. **Rate limiting muy restrictivo**
   - Ajustar límites en `backend/middleware/security.js`
   - Verificar headers de rate limit en respuestas

3. **Métricas no aparecen**
   - Verificar que `/metrics` responde correctamente
   - Comprobar configuración de Prometheus
   - Revisar formato de métricas

4. **Health check falla**
   - Verificar conexión a MongoDB
   - Comprobar configuración de Redis
   - Revisar logs de aplicación

### Comandos útiles:

```bash
# Verificar health check
curl http://localhost:5000/api/health

# Obtener métricas
curl http://localhost:5000/metrics

# Test con correlation ID
curl -H "x-correlation-id: debug-123" http://localhost:5000/api/products

# Verificar rate limits
for i in {1..10}; do curl -w "%{http_code}\n" http://localhost:5000/api/products; done
```
