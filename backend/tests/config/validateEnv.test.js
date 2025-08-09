const { validateEnv } = require('../../config/validateEnv');

describe('Environment Validation', () => {
  const validEnv = {
    NODE_ENV: 'test',
    PORT: 3000,
    MONGODB_URI: 'mongodb://localhost:27017/test',
    JWT_SECRET: 'test_jwt_secret_min_32_chars_for_testing',
    FRONTEND_URL: 'http://localhost:3000'
  };

  test('should validate correct environment variables', () => {
    expect(() => validateEnv(validEnv)).not.toThrow();
    
    const result = validateEnv(validEnv);
    expect(result.NODE_ENV).toBe('test');
    expect(result.PORT).toBe(3000);
    expect(result.MONGODB_URI).toBe(validEnv.MONGODB_URI);
  });

  test('should throw error for missing required variables', () => {
    const invalidEnv = { ...validEnv };
    delete invalidEnv.MONGODB_URI;

    expect(() => validateEnv(invalidEnv)).toThrow('Invalid environment configuration');
  });

  test('should throw error for invalid NODE_ENV', () => {
    const invalidEnv = { ...validEnv, NODE_ENV: 'invalid' };

    expect(() => validateEnv(invalidEnv)).toThrow('Invalid environment configuration');
  });

  test('should throw error for short JWT_SECRET', () => {
    const invalidEnv = { ...validEnv, JWT_SECRET: 'short' };

    expect(() => validateEnv(invalidEnv)).toThrow('Invalid environment configuration');
  });

  test('should throw error for invalid URI format', () => {
    const invalidEnv = { ...validEnv, MONGODB_URI: 'not-a-uri' };

    expect(() => validateEnv(invalidEnv)).toThrow('Invalid environment configuration');
  });

  test('should allow optional variables', () => {
    const envWithOptional = {
      ...validEnv,
      REDIS_URL: 'redis://localhost:6379',
      CSP_CONNECT_EXTRA: 'https://api.example.com'
    };

    expect(() => validateEnv(envWithOptional)).not.toThrow();
    
    const result = validateEnv(envWithOptional);
    expect(result.REDIS_URL).toBe('redis://localhost:6379');
    expect(result.CSP_CONNECT_EXTRA).toBe('https://api.example.com');
  });

  test('should set default values', () => {
    const minimalEnv = {
      NODE_ENV: 'development',
      MONGODB_URI: 'mongodb://localhost:27017/test',
      JWT_SECRET: 'test_jwt_secret_min_32_chars_for_testing',
      FRONTEND_URL: 'http://localhost:3000'
    };

    const result = validateEnv(minimalEnv);
    expect(result.PORT).toBe(5000); // valor por defecto
  });
});
