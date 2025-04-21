"use client"
import { Suspense } from "react"
import { motion, useScroll } from "framer-motion"
import RegisterSection from "./components/RegisterSection"
import PromotionalSection from "./components/SeccionHome"
import Footer from "@/components/Footer"

function Loading() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
    </div>
  )
}

export default function Page() {
  const { scrollYProgress } = useScroll()

  return (
    <>
      {/* Barra de progreso de scroll */}
      <motion.div
        style={{
          scaleX: scrollYProgress,
          backgroundColor: "white",
          height: "4px",
          width: "100%",
          position: "fixed",
          top: 0,
          left: 0,
          transformOrigin: "0 0",
          zIndex: 50,
        }}
      />

      <main className="min-h-screen">
        {/* Sección de registro */}
        <RegisterSection />

        {/* Sección promocional */}
        <div className="hidden lg:block">
          <Suspense fallback={<Loading />}>
            <PromotionalSection />
          </Suspense>
        </div>

        {/* Footer */}
        <Footer />
      </main>
    </>
  )
}
