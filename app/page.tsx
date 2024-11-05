"use client"
import { motion, useScroll } from "framer-motion"; // Importar Framer Motion
import Image from "next/image";
import HomePage from "@/components/HomePage";
import Footer from "@/components/Footer";
import AboutContent from "@/components/AboutContent";
import About from "@/components/About";
import DeliveryAboutUs from "@/components/DeliveryAbout";

export default function Home() {
  const { scrollYProgress } = useScroll(); // Hook para obtener el progreso de scroll

  return (
    <>
      {/* Barra de progreso de scroll */}
      <motion.div
        style={{
          scaleX: scrollYProgress,
          backgroundColor: "red",
          height: "6px",
          width: "100%",
          position: "fixed",
          top: 0,
          left: 0,
          transformOrigin: "0 0",
          zIndex: 50,
        }}
      />

      <main>
        <div>
          <HomePage />
          <AboutContent />
          <About />
          <DeliveryAboutUs />
        </div>
        <Footer />
      </main>
    </>
  );
}
