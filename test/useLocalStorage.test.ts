import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useLocalStorage from '../src/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns the initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('reads an existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored-value');
  });

  it('writes a new value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', ''));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'));
  });

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage<number>('counter', 0));

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(5);
    expect(localStorage.getItem('counter')).toBe('5');
  });

  it('stores and retrieves arrays', () => {
    const initial: string[] = [];
    const { result } = renderHook(() => useLocalStorage<string[]>('list', initial));

    act(() => {
      result.current[1](['a', 'b', 'c']);
    });

    expect(result.current[0]).toEqual(['a', 'b', 'c']);
  });

  it('stores and retrieves objects', () => {
    const { result } = renderHook(() =>
      useLocalStorage<{ name: string }>('obj', { name: '' })
    );

    act(() => {
      result.current[1]({ name: 'Bella' });
    });

    expect(result.current[0]).toEqual({ name: 'Bella' });
  });
});
