import React from 'react';
<<<<<<< HEAD
import Image from 'next/image';
import Logo from '@/src/assets/img/logotipo.png';

function Footer() {
  return (
    <footer className="bg-[#fff] text-gray-700 py-8">
=======

function Footer() {
  return (
    <footer className="bg-[#f0c5c5] text-gray-800 py-8">
>>>>>>> 5ab54bc479f1f03d2f4bb12a0b68cf1f441938a8
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          
          {/* Logo y descripción */}
<<<<<<< HEAD
          <div className="w-full sm:w-1/3 mb-6 sm:mb-0 flex items-center justify-center  ">
          
            <Image src={Logo} alt="logo" width={200} height={200} className="mx-auto" />
=======
          <div className="w-full sm:w-1/3 mb-6 sm:mb-0">
            <h2 className="text-2xl font-serif text-white">
              TRUE
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                LOVE
              </span>
            </h2>
            <p className="text-gray-700 mt-2">
              Connecting hearts and building meaningful relationships. Join us in your journey to find companionship and love.
            </p>
>>>>>>> 5ab54bc479f1f03d2f4bb12a0b68cf1f441938a8
          </div>

          {/* Enlaces rápidos */}
          <div className="w-full sm:w-1/3 mb-6 sm:mb-0">
<<<<<<< HEAD
            <h3 className="text-xl font-semibold text-text-black">Quick Links</h3>
=======
            <h3 className="text-xl font-semibold text-gray-800">Quick Links</h3>
>>>>>>> 5ab54bc479f1f03d2f4bb12a0b68cf1f441938a8
            <ul className="mt-2 space-y-2">
              <li><a href="/about" className="hover:text-orange-500">About Us</a></li>
              <li><a href="/services" className="hover:text-orange-500">Services</a></li>
              <li><a href="/contact" className="hover:text-orange-500">Contact</a></li>
              <li><a href="/privacy" className="hover:text-orange-500">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div className="w-full sm:w-1/3">
<<<<<<< HEAD
            <h3 className="text-xl font-semibold text-black">Contact Us</h3>
=======
            <h3 className="text-xl font-semibold text-gray-800">Contact Us</h3>
>>>>>>> 5ab54bc479f1f03d2f4bb12a0b68cf1f441938a8
            <p className="text-gray-700 mt-2">Email: support@truelove.com</p>
            <p className="text-gray-700">Telefono: +51 456 780 454</p>
            <div className="flex mt-4 space-x-4">
              <a href="#" className="text-gray-600 hover:text-orange-500">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-600 hover:text-orange-500">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-600 hover:text-orange-500">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
<<<<<<< HEAD
        <div className="mt-8 text-center text-white border-t pt-4">
=======
        <div className="mt-8 text-center text-gray-600 border-t pt-4">
>>>>>>> 5ab54bc479f1f03d2f4bb12a0b68cf1f441938a8
          &copy; {new Date().getFullYear()} True Love. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
