// app\login\useLoginForm.ts
"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postData } from "../../services/apiService";

interface LoginFormData {
  usuario: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    usuario: string;
    email: string;
    [key: string]: unknown;
  };
  role: string;
}

interface ApiError {
  status: number;
  data: {
    error: string;
    type?: string;
  };
  message: string;
}

export const useLoginForm = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    usuario: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    usuario?: string;
    password?: string;
    general?: string;
  }>({});
  const router = useRouter();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!formData.usuario.trim()) {
      setErrors((prev) => ({ ...prev, usuario: "El usuario es requerido" }));
      setIsLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setErrors((prev) => ({
        ...prev,
        password: "La contraseña es requerida",
      }));
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("usuario", formData.usuario);
      formDataToSend.append("password", formData.password);

      const response = await postData<LoginResponse>({
        endpoint: "admin/login", // ruta del endpoind del controlador
        data: formDataToSend, // datos a enviar del formulario
      });

      // alamacer datos en el local storage
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("userRole", response.role);

      // Set cookies
      document.cookie = `authToken=${response.token}; path=/`;
      document.cookie = `userRole=${response.role}; path=/`;

      // forzar la recarga de la pagina
      router.refresh();

      //pequeña pausa para que se cargue la pagina
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Navigate based on role
      switch (response.role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "negocio":
          router.push("/socio/admin");
          break;
        case "motorizado":
          router.push("/motorizado/admin");
          break;
        default:
          router.push("/login");
      }
    } catch (error) {
      console.error("Error en login:", error);
      const apiError = error as ApiError;

      if (apiError.data?.type === "wrong_password") {
        setErrors({ password: "Contraseña incorrecta" });
      } else if (apiError.data?.error) {
        setErrors({ general: apiError.data.error });
      } else if (error instanceof Error) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: "Credenciales incorrectas" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    showPassword,
    isLoading,
    errors,
    togglePasswordVisibility,
    handleChange,
    handleSubmit,
  };
};
