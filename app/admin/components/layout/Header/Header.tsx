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
      className={`bg-white fixed ${collapsed ? "lg:left-20" : "lg:left-64"} top-0 right-0 z-10 px-4 py-3 flex gap-4 items-center justify-between shadow-sm border-b border-gray-100 transition-all duration-300`}
    >
      <div className="lg:hidden flex items-center">
        <button
          ref={openSidebarRef}
          onClick={() => {
            setShowSidebar(true)
          }}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </button>
      </div>
      <SearchBox />
      <AvatarSettings />
    </header>
  )
}

