import Image from "next/image";

import HomePage from "@/components/HomePage"
import Footer from "@/components/Footer";

import AboutContent from '@/components/AboutContent'
import About from "@/components/About";
import DeliveryAboutUs from "@/components/DeliveryAbout";
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
