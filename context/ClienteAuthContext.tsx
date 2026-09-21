// context/ClienteAuthContext.tsx
"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Cliente, clienteLogout as apiLogout, clienteMe } from "@/services/clienteAuthService";

const TOKEN_KEY = "clienteAuthToken";
const CLIENTE_KEY = "clienteData";

interface ClienteAuthContextValue {
  cliente: Cliente | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, cliente: Cliente) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const ClienteAuthContext = createContext<ClienteAuthContextValue | undefined>(undefined);

export function ClienteAuthProvider({ children }: { children: React.ReactNode }) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedCliente = localStorage.getItem(CLIENTE_KEY);

    if (storedToken && storedCliente) {
      setToken(storedToken);
      setCliente(JSON.parse(storedCliente));

      clienteMe(storedToken)
        .then((freshCliente) => {
          setCliente(freshCliente);
          localStorage.setItem(CLIENTE_KEY, JSON.stringify(freshCliente));
        })
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(CLIENTE_KEY);
          setToken(null);
          setCliente(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((newToken: string, newCliente: Cliente) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(CLIENTE_KEY, JSON.stringify(newCliente));
    setToken(newToken);
    setCliente(newCliente);
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      await apiLogout(token).catch(() => undefined);
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CLIENTE_KEY);
    setToken(null);
    setCliente(null);
  }, [token]);

  const refresh = useCallback(async () => {
    if (!token) return;
    const freshCliente = await clienteMe(token);
    setCliente(freshCliente);
    localStorage.setItem(CLIENTE_KEY, JSON.stringify(freshCliente));
  }, [token]);

  return (
    <ClienteAuthContext.Provider
      value={{ cliente, token, isLoading, isAuthenticated: !!token, login, logout, refresh }}
    >
      {children}
    </ClienteAuthContext.Provider>
  );
}

export function useClienteAuth() {
  const context = useContext(ClienteAuthContext);
  if (!context) {
    throw new Error("useClienteAuth debe usarse dentro de ClienteAuthProvider");
  }
  return context;
}
