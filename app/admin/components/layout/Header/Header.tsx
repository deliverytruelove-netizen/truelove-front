import type React from "react"
import { RiMenu2Line } from "react-icons/ri"
import AvatarSettings from "./AvatarSettings"
import SearchBox from "./SearchBox"

interface Props {
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>
  openSidebarRef: React.MutableRefObject<HTMLButtonElement | null>
}

export const Header: React.FC<Props> = ({ setShowSidebar, openSidebarRef }) => {
  return (
    <header className="bg-white fixed lg:left-64 top-0 right-0 z-40 rounded-md shadow-sm px-2 sm:px-4 py-2 flex gap-4 items-center justify-between">
      <div className="lg:hidden flex items-center">
        <button
          ref={openSidebarRef}
          onClick={() => {
            setShowSidebar(true)
          }}
        >
          <RiMenu2Line className="text-2xl text-color-main" />
        </button>
      </div>
      <SearchBox />
      <AvatarSettings />
    </header>
  )
}

