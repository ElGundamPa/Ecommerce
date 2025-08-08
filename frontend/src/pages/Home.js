import React, { useState, useEffect } from 'react';
import { Search, Grid, List } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'

  // Cargar productos y categorías
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          productService.getAll(),
          productService.getCategories()
        ]);
        
        setProducts(productsData.data);
        setCategories(categoriesData.data);
      } catch (err) {
        setError('Error cargando productos. Por favor, intenta de nuevo.');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    const applyFilters = async () => {
      try {
        setLoading(true);
        const filters = {};
        
        if (searchTerm) filters.search = searchTerm;
        if (selectedCategory) filters.category = selectedCategory;
        if (minPrice) filters.minPrice = minPrice;
        if (maxPrice) filters.maxPrice = maxPrice;

        const response = await productService.getAll(filters);
        setProducts(response.data);
      } catch (err) {
        setError('Error aplicando filtros. Por favor, intenta de nuevo.');
        console.error('Error applying filters:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce para evitar muchas llamadas a la API
    const timeoutId = setTimeout(applyFilters, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, minPrice, maxPrice]);

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🛒 Nuestros Productos
        </h1>
        <p className="text-gray-600">
          Descubre nuestra amplia selección de productos de calidad
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="lg:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Precio mínimo */}
          <div className="lg:w-32">
            <input
              type="number"
              placeholder="Precio min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Precio máximo */}
          <div className="lg:w-32">
            <input
              type="number"
              placeholder="Precio max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Botón limpiar */}
          <button
            onClick={clearFilters}
            className="btn-secondary lg:w-auto"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Controles de vista */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-gray-600">
          {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Lista de productos */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Aplicando filtros...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-600 mb-4">
            Intenta ajustar los filtros de búsqueda
          </p>
          <button
            onClick={clearFilters}
            className="btn-primary"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
