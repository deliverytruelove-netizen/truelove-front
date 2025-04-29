// app\login\page.tsx

"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoginForm } from "./useLoginForm";
import Image from "next/image";
import { FaEye, FaEyeSlash, FaChartBar } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { checkAuth } from "@/services/apiService";
import { Input } from "@/components/ui/input";

const LoginPage: React.FC = () => {
  const {
    formData,
    showPassword,
    isLoading,
    errors,
    togglePasswordVisibility,
    handleChange,
    handleSubmit,
  } = useLoginForm();

  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const { authenticated, role } = await checkAuth();
          if (authenticated) {
            switch (role) {
              case "admin":
                router.replace("/admin/dashboard");
                break;
              case "negocio":
                router.replace("/socio/admin");
                break;
              case "motorizado":
                router.replace("/motorizado/admin");
                break;
              default:
                // Si el rol no es reconocido, no redirigimos
                break;
            }
          }
        } catch (error) {
          console.error("Error verificando autenticación:", error);
        }
      }
    };

    verifyAuth();
  }, [router]);
  //   const token = localStorage.getItem("authToken");
  //   if (token) {
  //     router.push("/admin/dashboard");
  //   }
  // }, [router]);

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-red-50 items-center justify-center">
        <div className="max-w-md p-8">
          <div className="mb-8">
            <Image
              src="/food.svg"
              alt="Store Icon"
              width={800}
              height={435}
              className="w-full h-auto"
            />
          </div>
          <h4 className="text-2xl font-bold mb-6 text-center text-red-800">
            Transforma tu negocio con True Love Portal
          </h4>
          <div className="space-y-6">
            {[
              "Monitorea tu desempeño y accede a información valiosa para mejorar las ventas y tener clientes leales.",
              "Ofrece descuentos y contrata campañas de publicidad para atraer nuevos clientes.",
              "Mantén tu menú, horarios de apertura y toda la información de tu local actualizada.",
            ].map((text, index) => (
              <div key={index} className="flex items-start space-x-4">
                <FaChartBar className="flex-shrink-0 w-6 h-6 text-red-600" />
                <p className="text-sm text-red-700">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-2xl font-bold text-center mb-6 text-red-800">
              Inicia sesión con tu usuario
            </h3>

            {errors.general && (
              <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm mb-4">
                {errors.general}
              </div>
            )}

            <div>
              <label
                htmlFor="usuario"
                className="block text-sm font-medium text-red-700 mb-1"
              >
                Usuario
              </label>
              <Input
                type="text"
                name="usuario"
                id="usuario"
                value={formData.usuario}
                onChange={handleChange}
                className={errors.usuario ? "border-red-500" : ""}
                placeholder="usuario"
              />
              {errors.usuario && (
                <p className="mt-1 text-sm text-red-600">{errors.usuario}</p>
              )}
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-red-700 mb-1"
              >
                Contraseña
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-red-500" : ""}
                placeholder="Contraseña"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-8 text-red-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="text-right">
              <a
                href="/login/recuperar-contrasena"
                className="text-sm text-red-600 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5 mx-auto" />
              ) : (
                "Iniciar Sesión"
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-red-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-red-500">O</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full bg-red-100 text-red-800 py-2 px-4 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200"
            >
              Inicia sesión con número de teléfono
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
