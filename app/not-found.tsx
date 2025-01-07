import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function NotFound() {
  return (
    <main className="h-screen w-full bg-zinc-900 flex flex-col items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent"></div>
      <div className="absolute inset-0 opacity-0 bg-black"></div>
      <Image 
        src="/logo.png" 
        alt="TrueLove Delivery Logo" 
        width={200} 
        height={200} 
        className="mb-8"
        priority
      />
      <h1 className="text-white text-4xl font-bold mt-8 text-center max-w-md tracking-tight" style={{ fontFamily: 'system-ui' }}>
        Esta página no se encuentra disponible. Lo sentimos.
      </h1>
      <Button asChild className="bg-red-600 text-white hover:bg-red-700 transition-all duration-300 text-lg font-semibold px-8 py-3 rounded-none shadow-lg hover:shadow-xl transform hover:-translate-y-1 mt-8 uppercase tracking-wider">
        <Link href="/">Inicio</Link>
      </Button>
    </main>
  )
}

