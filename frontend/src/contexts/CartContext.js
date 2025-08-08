import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Estado inicial del carrito
const initialState = {
  items: [],
  total: 0,
  itemCount: 0
};

// Tipos de acciones
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Reducer del carrito
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const existingItem = state.items.find(item => item._id === action.payload._id);
      
      if (existingItem) {
        // Si el item ya existe, aumentar cantidad
        const updatedItems = state.items.map(item =>
          item._id === action.payload._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
          ...state,
          items: updatedItems,
          total: newTotal,
          itemCount: newItemCount
        };
      } else {
        // Si es un item nuevo, agregarlo
        const newItems = [...state.items, { ...action.payload, quantity: 1 }];
        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
          ...state,
          items: newItems,
          total: newTotal,
          itemCount: newItemCount
        };
      }
    }
    
    case CART_ACTIONS.REMOVE_ITEM: {
      const updatedItems = state.items.filter(item => item._id !== action.payload);
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: updatedItems,
        total: newTotal,
        itemCount: newItemCount
      };
    }
    
    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Si la cantidad es 0 o menor, remover el item
        return cartReducer(state, { type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
      }
      
      const updatedItems = state.items.map(item =>
        item._id === productId
          ? { ...item, quantity }
          : item
      );
      
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: updatedItems,
        total: newTotal,
        itemCount: newItemCount
      };
    }
    
    case CART_ACTIONS.CLEAR_CART:
      return initialState;
    
    case CART_ACTIONS.LOAD_CART:
      return action.payload;
    
    default:
      return state;
  }
};

// Crear contexto
const CartContext = createContext();

// Hook personalizado para usar el contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

// Proveedor del contexto
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem('ecommerce-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: parsedCart });
      } catch (error) {
        console.error('Error cargando carrito desde localStorage:', error);
        localStorage.removeItem('ecommerce-cart');
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('ecommerce-cart', JSON.stringify(state));
  }, [state]);

  // Funciones del carrito
  const addToCart = (product) => {
    dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: product });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item._id === productId);
    return item ? item.quantity : 0;
  };

  const isInCart = (productId) => {
    return state.items.some(item => item._id === productId);
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
