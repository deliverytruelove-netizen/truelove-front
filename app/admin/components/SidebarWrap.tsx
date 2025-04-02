// app\admin\components\SidebarWrap.tsx
"use client"
import { useRef, useState } from "react"
import type React from "react"

import { Sidebar } from "./Sidebar"
import { Header } from "./layout/Header/Header"

const SidebarWrap: React.FC = () => {
  const openSidebarRef = useRef<HTMLButtonElement | null>(null)
  const [showSidebar, setShowSidebar] = useState<boolean>(false)
  const [collapsed, setCollapsed] = useState<boolean>(false)

  return (
    <>
      <Header setShowSidebar={setShowSidebar} openSidebarRef={openSidebarRef} collapsed={collapsed} />
      <Sidebar
        setShowSidebar={setShowSidebar}
        showSidebar={showSidebar}
        openSidebarRef={openSidebarRef}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
    </>
  )
}

export default SidebarWrap

