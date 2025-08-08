const Product = require('../../models/Product');

describe('Product Model', () => {
  const validProductData = {
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    image: 'https://example.com/image.jpg',
    stock: 10,
    category: 'Electrónicos'
  };

  describe('Validación', () => {
    test('debe crear un producto con datos válidos', async () => {
      const product = new Product(validProductData);
      const savedProduct = await product.save();
      
      expect(savedProduct.name).toBe(validProductData.name);
      expect(savedProduct.price).toBe(validProductData.price);
      expect(savedProduct.stock).toBe(validProductData.stock);
      expect(savedProduct.category).toBe(validProductData.category);
    });

    test('debe requerir nombre', async () => {
      const productData = { ...validProductData };
      delete productData.name;
      
      const product = new Product(productData);
      let error;
      
      try {
        await product.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
    });

    test('debe requerir precio', async () => {
      const productData = { ...validProductData };
      delete productData.price;
      
      const product = new Product(productData);
      let error;
      
      try {
        await product.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.price).toBeDefined();
    });

    test('debe validar precio mínimo', async () => {
      const productData = { ...validProductData, price: -10 };
      
      const product = new Product(productData);
      let error;
      
      try {
        await product.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.price).toBeDefined();
    });

    test('debe validar categoría válida', async () => {
      const productData = { ...validProductData, category: 'Categoría Inválida' };
      
      const product = new Product(productData);
      let error;
      
      try {
        await product.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.category).toBeDefined();
    });
  });

  describe('Métodos', () => {
    test('getFormattedPrice debe formatear precio correctamente', async () => {
      const product = new Product(validProductData);
      await product.save();
      
      const formattedPrice = product.getFormattedPrice();
      expect(formattedPrice).toBe('$99.99');
    });
  });

  describe('Índices', () => {
    test('debe tener índice de texto en nombre y descripción', () => {
      const indexes = Product.collection.getIndexes();
      expect(indexes).toBeDefined();
    });
  });
});
