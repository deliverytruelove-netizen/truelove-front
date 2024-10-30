import React from 'react';
import Image from 'next/image';
import Logo from '@/public/logo.png';

export default function Login() {
  return (
    <section className="h-full bg-white">
      <div className="container h-full p-10">
        <div className="flex h-full flex-wrap items-center justify-center text-neutral-800">
          <div className="w-full">
            <div className="block rounded-lg bg-white shadow-lg">
              <div className="g-0 lg:flex lg:flex-wrap">
                {/* Columna izquierda */}
                <div className="px-4 md:px-0 lg:w-6/12">
                  <div className="md:mx-6 md:p-12">
                    {/* Logo */}
                    <div className="text-center">
                      <Image
                        className="mx-auto w-48"
                        src={Logo}
                        alt="logo"
                      />
                      <h4 className="mb-12 mt-1 pb-1 text-xl font-semibold">
                        We are The Lotus Team
                      </h4>
                    </div>

                    <form>
                      <p className="mb-4">Please login to your account</p>

                      {/* Campo de usuario */}
                      <div className="relative mb-4">
                        <input
                          type="text"
                          className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary dark:text-black dark:placeholder:text-neutral-300"
                          id="username"
                          placeholder="Username"
                        />
                        <label
                          htmlFor="username"
                          className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary"
                        >
                          Username
                        </label>
                      </div>

                      {/* Campo de contraseña */}
                      <div className="relative mb-4">
                        <input
                          type="password"
                          className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary dark:text-black dark:placeholder:text-neutral-300"
                          id="password"
                          placeholder="Password"
                        />
                        <label
                          htmlFor="password"
                          className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary"
                        >
                          Password
                        </label>
                      </div>

                      {/* Botón de envío */}
                      <div className="mb-12 pb-1 pt-1 text-center">
                        <button
                          className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-dark-3 transition duration-150 ease-in-out hover:shadow-dark-2 focus:shadow-dark-2 focus:outline-none"
                          type="button"
                          style={{
                            background: '#007bff', // Cambiar el color de fondo aquí
                          }}
                        >
                          Log in
                        </button>

                        {/* Enlace para recuperar contraseña */}
                        <a href="#!" className="text-sm text-blue-500 hover:underline">Forgot password?</a>
                      </div>

                      {/* Botón de registro */}
                      <div className="flex items-center justify-between pb-6">
                        <p className="mb-0 me-2">Don't have an account?</p>
                        <button
                          type="button"
                          className="inline-block rounded border-2 border-danger px-6 pb-[6px] pt-2 text-xs font-medium uppercase leading-normal text-danger transition duration-150 ease-in-out hover:border-danger-600 hover:bg-danger-50/50 hover:text-danger-600 focus:border-danger-600 focus:bg-danger-50/50 focus:text-danger-600 focus:outline-none"
                        >
                          Register
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Columna derecha con fondo y descripción */}
                <div className="flex items-center rounded-b-lg lg:w-6/12 lg:rounded-e-lg lg:rounded-bl-none bg-white">
                  <div className="px-4 py-6 text-black md:mx-6 md:p-12">
                    <h4 className="mb-6 text-xl font-semibold">
                      We are more than just a company
                    </h4>
                    <p className="text-sm">
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
