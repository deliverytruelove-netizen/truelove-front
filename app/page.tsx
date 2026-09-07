// app/page.tsx
import HomePage from "@/components/HomePage";
import Footer from "@/components/Footer";
import StatsStrip from "@/components/StatsStrip";
import BenefitsSection from "@/components/BenefitsSection";
import HowItWorks from "@/components/HowItWorks";
import AppShowcase from "@/components/AppShowcase";
import Navbar from "@/components/Navbar";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { getLandingStats } from "@/services/landingService";

export default async function Home() {
  const stats = await getLandingStats();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <ScrollProgressBar />

      <Navbar />
      <main className="flex-grow">
        <HomePage stats={stats} />
        <StatsStrip stats={stats} />
        <BenefitsSection />
        <HowItWorks />
        <AppShowcase />
      </main>
      <Footer />
    </div>
  );
}
