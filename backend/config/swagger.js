const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Ecommerce API',
      version: '2.0.0',
      description: `
        API completa para ecommerce con autenticación JWT, gestión de productos, órdenes y más.
        
        ## Características
        - Autenticación JWT con refresh tokens
        - Rate limiting y seguridad avanzada
        - Cache Redis opcional
        - Métricas Prometheus
        - Validación robusta con Joi
        
        ## Rate Limits
        - Global: 100 requests / 15 minutos
        - Login: 20 requests / 15 minutos  
        - Orders: 50 requests / 15 minutos
      `,
      contact: {
        name: 'API Support',
        email: 'support@ecommerce.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.ecommerce.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del endpoint /api/auth/login'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Email is required' }
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Camiseta Premium' },
            description: { type: 'string', example: 'Camiseta de algodón 100% orgánico' },
            price: { type: 'number', example: 29.99 },
            category: { type: 'string', example: 'Ropa' },
            stock: { type: 'integer', example: 100 },
            image: { type: 'string', example: 'https://example.com/image.jpg' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ProductList: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Product' }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 12 },
                total: { type: 'integer', example: 150 },
                pages: { type: 'integer', example: 13 }
              }
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
            user: { type: 'string', example: '507f1f77bcf86cd799439010' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  quantity: { type: 'integer', example: 2 },
                  price: { type: 'number', example: 29.99 }
                }
              }
            },
            total: { type: 'number', example: 59.98 },
            status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], example: 'pending' },
            shippingAddress: {
              type: 'object',
              properties: {
                street: { type: 'string', example: 'Av. Principal 123' },
                city: { type: 'string', example: 'Ciudad' },
                state: { type: 'string', example: 'Estado' },
                zipCode: { type: 'string', example: '12345' },
                country: { type: 'string', example: 'País' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acceso faltante o inválido',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                message: 'Token inválido'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Acceso denegado - permisos insuficientes',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                message: 'Acceso denegado'
              }
            }
          }
        },
        ValidationError: {
          description: 'Error de validación en los datos enviados',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                message: 'Datos de entrada inválidos',
                errors: [
                  {
                    field: 'email',
                    message: 'Email is required'
                  }
                ]
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                message: 'Recurso no encontrado'
              }
            }
          }
        },
        RateLimitError: {
          description: 'Límite de requests excedido',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                message: 'Demasiadas solicitudes. Intenta en 15 minutos.'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './models/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = swaggerDocs;


