'use client'

import { useCambiarContrasena } from '../hooks/useCambiarContrasena';
import { FaEye, FaEyeSlash, FaChartBar, FaCheck, FaTimes } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function RecuperarContrasenaPage() {
    const {
        formData,
        showPassword,
        isLoading,
        errorMessage,
        successMessage,
        togglePasswordVisibility,
        handleChange,
        handleSubmit,
        isEmailVerified,
        handleVerifyEmail,
        passwordValidation
    } = useCambiarContrasena();

    return (
        <div className="flex min-h-screen">
            {/* Panel izquierdo - Solo visible en pantallas grandes */}
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
                        Recupera el acceso a tu cuenta True Love Portal
                    </h4>
                    <div className="space-y-6">
                        {[
                            "Restablece tu contraseña de forma segura y rápida.",
                            "Mantén el control de tu cuenta con una contraseña fuerte.",
                            "Vuelve a acceder a todas las funcionalidades de tu portal."
                        ].map((text, index) => (
                            <div key={index} className="flex items-start space-x-4">
                                <FaChartBar className="flex-shrink-0 w-6 h-6 text-red-600" />
                                <p className="text-sm text-red-700">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Panel derecho - Formulario */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="max-w-md w-full">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h3 className="text-2xl font-bold text-center mb-6 text-red-800">
                            Restablece tu contraseña
                        </h3>

                        <div className="flex items-center space-x-2">
                            <div className="flex-grow">
                                <label htmlFor="email" className="block text-sm font-medium text-red-700 mb-1">
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={isEmailVerified}
                                    className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-red-900 placeholder-red-300 disabled:bg-gray-100"
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleVerifyEmail}
                                disabled={isEmailVerified || isLoading}
                                className="mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50"
                            >
                                {isEmailVerified ? 'Verificado' : 'Verificar'}
                            </button>
                        </div>

                        {isEmailVerified && (
                            <div className="relative">
                                <label htmlFor="newPassword" className="block text-sm font-medium text-red-700 mb-1">
                                    Nueva contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="newPassword"
                                        id="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-red-900 placeholder-red-300"
                                        placeholder="Nueva contraseña"
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {isEmailVerified && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-red-700">La contraseña debe tener:</p>
                                <ul className="space-y-1">
                                    {Object.entries(passwordValidation).map(([key, isValid]) => (
                                        <li key={key} className={`flex items-center text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                                            {isValid ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
                                            {key === 'minLength' && 'Al menos 8 caracteres'}
                                            {key === 'hasUpperCase' && 'Una letra mayúscula'}
                                            {key === 'hasLowerCase' && 'Una letra minúscula'}
                                            {key === 'hasNumber' && 'Un número'}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {errorMessage && (
                            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                {errorMessage}
                            </p>
                        )}

                        {successMessage && (
                            <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                                {successMessage}
                            </p>
                        )}

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => window.location.href = '/login'}
                                className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200"
                            >
                                Volver al login
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !isEmailVerified || !Object.values(passwordValidation).every(Boolean)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                                ) : (
                                    'Restablecer contraseña'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

