import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/src/assets/img/logotipo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-gray-700 py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and description */}
          <motion.div
            className="flex flex-col items-center md:items-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={Logo}
              alt="TRUE LOVE logo"
              width={200}
              height={100}
              className="mb-4"
            />
            <p className="text-sm text-center md:text-left text-gray-600 mt-2">
              Entregando excelencia y puntualidad en cada pedido.
            </p>
          </motion.div>

          {/* Quick links */}
          <motion.div
            className="flex flex-col items-center md:items-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Enlaces Rápidos
            </h3>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/about"
                className="text-gray-600 hover:text-orange-500 transition-colors"
              >
                Sobre Nosotros
              </Link>
              <Link
                href="/soporte"
                className="text-gray-600 hover:text-orange-500 transition-colors"
              >
                Soporte
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-orange-500 transition-colors"
              >
                Contacto
              </Link>
              <Link
                href="/politicas-de-privacidad"
                className="text-gray-600 hover:text-orange-500 transition-colors"
              >
                Política de Privacidad
              </Link>
            </nav>
          </motion.div>

          {/* Contact information */}
          <motion.div
            className="flex flex-col items-center md:items-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contáctanos
            </h3>
            <p className="text-gray-600 mb-2">
              Correo: info@deliverytruelove.com
            </p>
            <p className="text-gray-600 mb-4">Teléfono: +51 989 815 260</p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          className="mt-8 pt-4 border-t text-center text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          &copy; {currentYear}{" "}
          <Link href="https://magustechnologies.com/" className="text-red-600">
            {" "}
            Magus Technologies
          </Link>
          . Todos los derechos reservados.
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
