// app\page.tsx
"use client"
import { motion, useScroll } from "framer-motion"; // Importar Framer Motion
import HomePage from "@/components/HomePage";
import Footer from "@/components/Footer";
import AboutContent from "@/components/AboutContent";
import About from "@/components/About";
import DeliveryAboutUs from "@/components/DeliveryAbout";
import Navbar from "@/components/Navbar";

export default function Home() {
  const { scrollYProgress } = useScroll(); 

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

      <main  className="pt-[60px]">
        <Navbar/>
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