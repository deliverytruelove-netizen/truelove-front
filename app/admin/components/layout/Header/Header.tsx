// app\admin\components\layout\Header\Header.tsx
"use client"

import type React from "react"
import { Menu } from "lucide-react"
import AvatarSettings from "./AvatarSettings"
import SearchBox from "./SearchBox"

interface Props {
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>
  openSidebarRef: React.MutableRefObject<HTMLButtonElement | null>
  collapsed: boolean
}

export const Header: React.FC<Props> = ({ setShowSidebar, openSidebarRef, collapsed }) => {
  return (
    <header
      className={`bg-white fixed ${
        collapsed ? "lg:left-20" : "lg:left-64"
      } left-0 top-0 right-0 z-50 px-2 sm:px-4 py-2 sm:py-3 flex items-center shadow-sm border-b border-gray-100 transition-all duration-300`}
    >
      <button
        ref={openSidebarRef}
        onClick={() => setShowSidebar(true)}
        className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors mr-2"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>
      
      <div className="flex-1 min-w-0 px-0 sm:px-2">
        <SearchBox />
      </div>
      
      <div className="ml-2 sm:ml-4">
        <AvatarSettings />
      </div>
    </header>
  )
}