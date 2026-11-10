import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { CartProvider, useCart } from '../src/context/CartContext';
import { Pet } from '../src/types';

const mockDog: Pet = {
  id: 'golden-retriever',
  name: 'Golden Retriever',
  category: 'Dogs',
  price: 500,
  imageUrl: '',
  description: 'A friendly dog',
};

const mockCat: Pet = {
  id: 'maine-coon',
  name: 'Maine Coon',
  category: 'Cats',
  price: 600,
  imageUrl: '',
  description: 'A gentle cat',
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('Cart logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with an empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.cartItems).toHaveLength(0);
    expect(result.current.cartTotal).toBe(0);
    expect(result.current.cartCount).toBe(0);
  });

  it('adds a pet to the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockDog);
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].pet.id).toBe('golden-retriever');
    expect(result.current.cartItems[0].quantity).toBe(1);
  });

  it('increments quantity when same pet is added twice', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockDog);
      result.current.addToCart(mockDog);
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].quantity).toBe(2);
  });

  it('adds multiple different pets', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockDog);
      result.current.addToCart(mockCat);
    });

    expect(result.current.cartItems).toHaveLength(2);
  });

  it('removes a pet from the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockDog);
      result.current.addToCart(mockCat);
    });

    act(() => {
      result.current.removeFromCart('golden-retriever');
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].pet.id).toBe('maine-coon');
  });

  it('calculates the correct cart total', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockDog);
      result.current.addToCart(mockCat);
    });

    expect(result.current.cartTotal).toBe(1100);
  });

  it('calculates total with quantity > 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockDog);
      result.current.addToCart(mockDog);
    });

    expect(result.current.cartTotal).toBe(1000);
  });

  it('calculates correct cart count', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockDog);
      result.current.addToCart(mockCat);
      result.current.addToCart(mockDog);
    });

    expect(result.current.cartCount).toBe(3);
  });

  it('updates quantity of a cart item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockDog);
    });

    act(() => {
      result.current.updateQuantity('golden-retriever', 4);
    });

    expect(result.current.cartItems[0].quantity).toBe(4);
    expect(result.current.cartTotal).toBe(2000);
  });

  it('removes item when quantity is set to 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockDog);
    });

    act(() => {
      result.current.updateQuantity('golden-retriever', 0);
    });

    expect(result.current.cartItems).toHaveLength(0);
  });

  it('clears the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockDog);
      result.current.addToCart(mockCat);
    });

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cartItems).toHaveLength(0);
    expect(result.current.cartTotal).toBe(0);
  });
});
