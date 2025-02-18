import type React from "react"
import { Breadcrumbs } from "./Breadcrumbs"
import SidebarWrap from "./SidebarWrap"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen w-full bg-[#f5f5f5]">
        <main className="lg:ml-64 min-h-screen bg-transparent">
          <SidebarWrap />
          <div className="pt-16 px-2 md:px-4 py-2">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </QueryClientProvider>
  )
}

export default MainLayout

