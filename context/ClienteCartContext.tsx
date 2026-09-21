// context/ClienteCartContext.tsx
"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const CART_STORAGE_KEY = "cart_data";

export interface CartAdicionalItem {
  id: number;
  titulo: string;
  precio: number;
}

export interface CartAdicionalGrupo {
  grupoId: number;
  grupoNombre: string;
  items: CartAdicionalItem[];
}

export interface CartItem {
  cartItemId: string;
  menuId: number;
  titulo: string;
  precio: number;
  foto: string | null;
  quantity: number;
  selectedAdicionales: CartAdicionalGrupo[];
}

export interface LocalCart {
  localId: number;
  localName: string;
  items: CartItem[];
}

type CartsState = Record<string, LocalCart>;

interface ClienteCartContextValue {
  carts: CartsState;
  totalItemsCount: number;
  getCartForLocal: (localId: number) => LocalCart | undefined;
  addItem: (localId: number, localName: string, item: CartItem) => void;
  removeItem: (localId: number, cartItemId: string) => void;
  updateQuantity: (localId: number, cartItemId: string, quantity: number) => void;
  clearCart: (localId: number) => void;
}

const ClienteCartContext = createContext<ClienteCartContextValue | undefined>(undefined);

export function cartItemTotal(item: CartItem): number {
  const adicionalesTotal = item.selectedAdicionales.reduce(
    (sum, grupo) => sum + grupo.items.reduce((s, i) => s + i.precio, 0),
    0
  );
  return (item.precio + adicionalesTotal) * item.quantity;
}

export function ClienteCartProvider({ children }: { children: React.ReactNode }) {
  const [carts, setCarts] = useState<CartsState>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) setCarts(JSON.parse(stored));
    } catch {
      // ignorar carrito corrupto
    }
  }, []);

  const persist = useCallback((next: CartsState) => {
    setCarts(next);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // almacenamiento no disponible, se mantiene solo en memoria
    }
  }, []);

  const getCartForLocal = useCallback((localId: number) => carts[String(localId)], [carts]);

  const addItem = useCallback(
    (localId: number, localName: string, item: CartItem) => {
      const key = String(localId);
      const existing = carts[key]?.items || [];
      persist({
        ...carts,
        [key]: { localId, localName, items: [...existing, item] },
      });
    },
    [carts, persist]
  );

  const removeItem = useCallback(
    (localId: number, cartItemId: string) => {
      const key = String(localId);
      const existing = carts[key];
      if (!existing) return;
      const items = existing.items.filter((i) => i.cartItemId !== cartItemId);
      if (items.length === 0) {
        const next = { ...carts };
        delete next[key];
        persist(next);
      } else {
        persist({ ...carts, [key]: { ...existing, items } });
      }
    },
    [carts, persist]
  );

  const updateQuantity = useCallback(
    (localId: number, cartItemId: string, quantity: number) => {
      const key = String(localId);
      const existing = carts[key];
      if (!existing) return;
      const items = existing.items.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity } : i));
      persist({ ...carts, [key]: { ...existing, items } });
    },
    [carts, persist]
  );

  const clearCart = useCallback(
    (localId: number) => {
      const next = { ...carts };
      delete next[String(localId)];
      persist(next);
    },
    [carts, persist]
  );

  const totalItemsCount = Object.values(carts).reduce(
    (sum, cart) => sum + cart.items.reduce((s, i) => s + i.quantity, 0),
    0
  );

  return (
    <ClienteCartContext.Provider
      value={{ carts, totalItemsCount, getCartForLocal, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </ClienteCartContext.Provider>
  );
}

export function useClienteCart() {
  const context = useContext(ClienteCartContext);
  if (!context) {
    throw new Error("useClienteCart debe usarse dentro de ClienteCartProvider");
  }
  return context;
}
