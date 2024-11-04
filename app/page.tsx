import Image from "next/image";

import HomePage from "@/src/components/HomePage"
import Footer from "@/src/components/Footer";

import AboutContent from '@/src/components/AboutContent'
import About from "@/src/components/About";
import DeliveryAboutUs from "@/src/components/DeliveryAbout";
export default function Home() {
  return (
   <>
   <main>
  
    <div>
      <HomePage/>
      <AboutContent/>
      <About/>
      <DeliveryAboutUs/>
    </div>
    <Footer />
   </main>
   </>
  );
}
