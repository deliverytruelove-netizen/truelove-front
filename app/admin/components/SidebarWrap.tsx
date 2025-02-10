// app\admin\components\SidebarWrap.tsx

'use client'
import { useRef, useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './layout/Header/Header'

const SidebarWrap: React.FC = () => {
  const openSidebarRef = useRef<HTMLButtonElement | null>(null)
  const [showSidebar, setShowSidebar] = useState<boolean>(false)

  return (
    <>
      <Header setShowSidebar={setShowSidebar} openSidebarRef={openSidebarRef} />
      <Sidebar
        setShowSidebar={setShowSidebar}
        showSidebar={showSidebar}
        openSidebarRef={openSidebarRef}
      />
    </>
  )
}

export default SidebarWrap
