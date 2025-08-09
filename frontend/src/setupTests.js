import '@testing-library/jest-dom';

// Mock global de axios para evitar errores ESM en Jest (CRA)
jest.mock('axios', () => {
  const mockInstance = {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: { response: { use: jest.fn() } },
    defaults: { headers: { common: {} } },
  };
  return {
    __esModule: true,
    default: {
      create: () => mockInstance,
    },
    create: () => mockInstance,
  };
});




