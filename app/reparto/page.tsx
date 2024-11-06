"use client";
import React, { useState } from "react";
import Image from "next/image";
import image from "@/src/assets/img/image.png";
import img from "@/src/assets/img/image2.jpeg";

import Footer from "@/components/Footer";
import { motion } from "framer-motion";
// import ParticlesBackground from "@/components/ParticlesBackground";

export default function Page() {
  const [departamento, setDepartamento] = useState("");
  const [vehiculo, setVehiculo] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [nroDocumento, setNroDocumento] = useState("");
  const [mayorEdad, setMayorEdad] = useState("");
  const [aceptaPolitica, setAceptaPolitica] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);

  const handleDepartamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDepartamento = e.target.value;
    setDepartamento(selectedDepartamento);
    setVehiculo("");
    setShowPersonalInfo(false);
  };

  const handleVehiculoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVehiculo = e.target.value;
    setVehiculo(selectedVehiculo);
    setShowPersonalInfo(selectedVehiculo !== "");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({
      departamento,
      vehiculo,
      nombres,
      apellidos,
      celular,
      email,
      nroDocumento,
      mayorEdad,
      aceptaPolitica,
    });
  };

  return (
    <div className="container mx-auto bg-white text-black">

      <div className="flex w-full p-4">
        <motion.div 
          className="w-1/2 flex justify-center items-center"
          initial={{ opacity: 0, x: -100 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <Image className="mx-auto w-full h-auto" src={img} alt="logo" />
        </motion.div>
        <motion.div 
          className="w-1/2 flex justify-center items-center"
          initial={{ opacity: 0, x: 100 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <form
            onSubmit={handleSubmit}
            className="bg-red-500 p-6 rounded-lg shadow-lg w-3/4"
          >
            <h2 className="text-xl font-bold text-white mb-4">Crear Perfil</h2>
            <div className="mb-4">
              <select
                id="departamento"
                value={departamento}
                onChange={handleDepartamentoChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 transition duration-200 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Selecciona un departamento
                </option>
                <option value="HUACHO">HUACHO</option>
              </select>
            </div>
            <div className="mb-4">
              <select
                id="vehiculo"
                value={vehiculo}
                onChange={handleVehiculoChange}
                required={departamento !== ""}
                disabled={departamento === ""}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 transition duration-200 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Selecciona un vehículo
                </option>
                <option value="MOTO">MOTO</option>
                <option value="BICICLETA">BICICLETA</option>
              </select>
            </div>
            {showPersonalInfo && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ duration: 0.3 }}
              >
                <input
                  type="text"
                  id="nombres"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  required
                  className="mt-4 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Ingresa tus nombres"
                />
                <input
                  type="text"
                  id="apellidos"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  required
                  className="mt-4 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Ingresa tus apellidos"
                />
                <input
                  type="text"
                  id="nroDocumento"
                  value={nroDocumento}
                  onChange={(e) => setNroDocumento(e.target.value)}
                  required
                  className="mt-4 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Ingresa tu número de documento"
                />
                <span className="block text-sm font-medium text-white mt-4">
                  ¿Tienes más de 18 años?
                </span>
                <div className="flex mt-2">
                  <label className="mr-4">
                    <input
                      type="radio"
                      value="sí"
                      checked={mayorEdad === "sí"}
                      onChange={() => setMayorEdad("sí")}
                      className="mr-2"
                    />
                    Sí
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="no"
                      checked={mayorEdad === "no"}
                      onChange={() => setMayorEdad("no")}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
                <input
                  type="tel"
                  id="celular"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  required
                  className="mt-4 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Ingresa tu número de celular"
                />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-4 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Ingresa tu email"
                />
                <div className="mb-4 flex items-center mt-4">
                  <input
                    type="checkbox"
                    id="politica"
                    checked={aceptaPolitica}
                    onChange={(e) => setAceptaPolitica(e.target.checked)}
                    required
                    className="mr-2"
                  />
                  <label htmlFor="politica" className="text-sm text-white">
                    Estoy de acuerdo con la política de privacidad y acepto ser
                    contactado por canales de terceros.
                  </label>
                </div>
              </motion.div>
            )}
            <div className="text-left mt-4">
              <button
                type="submit"
                disabled={!departamento || !vehiculo}
                className={`w-full bg-blue-600 text-white rounded-md p-2 hover:bg-blue-700 transition duration-200 ${
                  !departamento || !vehiculo
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() => {
                  if (departamento && vehiculo) {
                    window.location.href = "/dashboard";
                  }
                }}
              >
                Enviar
              </button>
            </div>
          </form>
        </motion.div>
      </div>
      <motion.div
        className="flex w-full p-4 mt-4 bg-gray-100 rounded-lg"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
      >
        <div className="w-1/2 p-4 flex flex-col justify-center items-center">
          <h3 className="text-3xl font-bold text-center text-blue-600 mb-2">
            ¡Vive la experiencia TRUE LOVER!
          </h3>
          <p className="text-lg text-center text-gray-700">
            Gana dinero repartiendo con la empresa líder de delivery en
            Latinoamérica.
          </p>
        </div>
        <div className="w-1/2 flex justify-center items-center">
          <div className="overflow-hidden rounded-full w-3/4 h-3/4 flex justify-center items-center">
            <Image
              className="object-cover w-full h-full"
              src={image}
              alt="logo"
            />
          </div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
}