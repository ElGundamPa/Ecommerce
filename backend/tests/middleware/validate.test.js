const { validate, validateSingle, Joi } = require('../../middleware/validate');
const { AppError } = require('../../middleware/error');

// Mock para next function
const mockNext = jest.fn();

// Mock para request y response
const mockReq = {
  body: {},
  params: {},
  query: {}
};

const mockRes = {};

describe('Validation Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReq.body = {};
    mockReq.params = {};
    mockReq.query = {};
  });

  describe('validate function', () => {
    const testSchema = {
      body: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        age: Joi.number().min(0)
      }),
      query: Joi.object({
        page: Joi.number().min(1).default(1)
      })
    };

    test('should pass validation with valid data', () => {
      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };
      mockReq.query = { page: 1 };

      const middleware = validate(testSchema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(AppError));
    });

    test('should strip unknown properties', () => {
      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com',
        unknownField: 'should be removed'
      };

      const middleware = validate(testSchema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockReq.body.unknownField).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should set default values', () => {
      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com'
      };
      mockReq.query = {};

      const middleware = validate(testSchema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockReq.query.page).toBe(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should call next with AppError for invalid data', () => {
      mockReq.body = {
        name: '', // invalid - required
        email: 'invalid-email', // invalid format
        age: -1 // invalid - negative
      };

      const middleware = validate(testSchema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Datos de entrada inválidos');
      expect(error.errors).toHaveLength(3);
    });
  });

  describe('validateSingle function', () => {
    const testSchema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required()
    });

    test('should validate single property (body)', () => {
      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const middleware = validateSingle(testSchema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(AppError));
    });

    test('should validate single property (query)', () => {
      const querySchema = Joi.object({
        search: Joi.string().max(100),
        page: Joi.number().min(1).default(1)
      });

      mockReq.query = { search: 'test', page: 2 };

      const middleware = validateSingle(querySchema, 'query');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should call next with AppError for invalid data', () => {
      mockReq.body = {
        name: '', // required field empty
        email: 'invalid-email'
      };

      const middleware = validateSingle(testSchema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Datos de entrada inválidos');
      expect(Array.isArray(error.errors)).toBe(true);
    });
  });
});
