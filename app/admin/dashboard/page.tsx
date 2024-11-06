import { Breadcrumbs } from '../components/Breadcrumbs'
import SidebarWrap from '../components/SidebarWrap'
import '../globals.css'

export const metadata = {
  title: 'Dashboard - TRUELOVE',
  description: 'View to authenticate in the application'
}

// Define the layout component directly
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#f5f5f5]">
      <main className="lg:ml-64 px-2 md:px-4 py-2 min-h-screen bg-transparent">
        <SidebarWrap />
        <Breadcrumbs />
        {children}
      </main>
    </div>
  )
}

export default Layout
