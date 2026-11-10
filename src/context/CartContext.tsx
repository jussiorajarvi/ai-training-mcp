import React, { createContext, useContext } from 'react';
import { CartItem, Pet } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (pet: Pet) => void;
  removeFromCart: (petId: string) => void;
  updateQuantity: (petId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>(
    'petstore-cart',
    []
  );

  const addToCart = (pet: Pet) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.pet.id === pet.id);
      if (existing) {
        return prev.map((item) =>
          item.pet.id === pet.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { pet, quantity: 1 }];
    });
  };

  const removeFromCart = (petId: string) => {
    setCartItems((prev) => prev.filter((item) => item.pet.id !== petId));
  };

  const updateQuantity = (petId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(petId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.pet.id === petId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.pet.price * item.quantity,
    0
  );
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
