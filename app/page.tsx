import Image from "next/image";
<<<<<<< HEAD

import HomePage from "@/components/HomePage"
import Footer from "@/components/Footer";

import AboutContent from '@/components/AboutContent'
import About from "@/components/About";
import DeliveryAboutUs from "@/components/DeliveryAbout";
=======
import Navbar from "@/components/Navbar";
import HomePage from "@/components/HomePage"
import Footer from "@/components/Footer";
>>>>>>> 5ab54bc479f1f03d2f4bb12a0b68cf1f441938a8
export default function Home() {
  return (
   <>
   <main>
<<<<<<< HEAD
  
    <div>
      <HomePage/>
      <AboutContent/>
      <About/>
      <DeliveryAboutUs/>
=======
    <Navbar/>
    <div>
      <HomePage/>
>>>>>>> 5ab54bc479f1f03d2f4bb12a0b68cf1f441938a8
    </div>
    <Footer />
   </main>
   </>
  );
}
