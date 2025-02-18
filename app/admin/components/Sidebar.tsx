// app\admin\components\Sidebar.tsx
'use client'
import Logo from '@/public/logo.png';
// import { links } from '@/config/constanst'
// import { privateRoutes } from '@/config/routes'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import {
  RiDashboardLine,
  RiMenu3Line,
  RiShieldUserLine,
  RiRidingFill
} from 'react-icons/ri'

const activeStyles =
  'bg-emerald-400 hover:bg-primary-500 transition-all text-white shadow-md flex gap-2 rounded-md text-color-main  transition-colors p-2'
const hoverStyles = 'hover:bg-gray-100'

interface Props {
  showSidebar: boolean
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>
  openSidebarRef: React.MutableRefObject<HTMLButtonElement | null>
}

export const Sidebar: React.FC<Props> = ({
  showSidebar,
  setShowSidebar,
  openSidebarRef
}) => {
  const sidebarRef = useRef<HTMLDivElement | null>(null)
  const pathname = usePathname()

  const matchPath = (path: string): boolean => {
    return pathname === path
  }

  const closeSidebar = useCallback((): void => {
    setShowSidebar(false)
  }, [setShowSidebar])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent): void => {
      if (
        sidebarRef.current !== null &&
        !(sidebarRef.current?.contains(e.target as Node) ?? false) &&
        !(openSidebarRef.current?.contains(e.target as Node) ?? false)
      ) {
        setShowSidebar(false)
      }
    }

    window.addEventListener('click', handleOutsideClick)

    return () => {
      window.removeEventListener('click', handleOutsideClick)
    }
  }, [setShowSidebar, openSidebarRef])

  useEffect(() => {
    closeSidebar()
  }, [pathname, closeSidebar])

  return (
    <div
      className={`fixed flex flex-col w-64 pb-5 top-0 ${showSidebar ? 'left-0 shadow-2xl' : '-left-full'
        } bg-white h-full transition-all lg:left-0 z-10`}
      ref={sidebarRef}
    >
      {/* Logo */}
      <div className="pt-5 pb-7 flex items-center justify-between px-4">
        <span className="flex gap-3 items-center">
          <Image
            src={Logo}
            alt="Logo of the app"
            width={35}
            height={35}
            className="brightness-[1.2]"
          />
          <span className="text-color-main font-semibold text-md tracking-widest">
            TrueLove
          </span>
        </span>
        <button onClick={closeSidebar} className="lg:hidden">
          <RiMenu3Line className="text-color-main text-2xl" />
        </button>
      </div>
      {/* Nav */}
      <nav className="px-4 flex flex-col gap-2 flex-1 overflow-y-auto">
        <Link
          href={'/admin/dashboard'}
          className={`${matchPath('/admin/dashboard') ? activeStyles : hoverStyles
            } flex gap-2 rounded-md text-color-main  transition-colors p-2`}
        >
          <RiDashboardLine className={`text-2xl ${matchPath('/admin/dashboard') ? 'text-white' : ''}`} />

          <span style={{ color: matchPath('/admin/dashboard') ? 'white !important' : 'inherit' }}>Dashboard</span>
        </Link>
        <Link
          href={'/admin/usuarios'}
          className={`${matchPath('/admin/usuarios') ? activeStyles : hoverStyles
            } flex gap-2 rounded-md text-color-main  transition-colors p-2`}
        >
          <RiShieldUserLine className="text-2xl" />
          <span style={{ color: matchPath('/admin/usuarios') ? 'white !important' : 'inherit' }}>Usuarios</span>
        </Link>
        <Link
          href={'/admin/socios'}
          className={`${matchPath('/admin/socios') ? activeStyles : hoverStyles
            } flex gap-2 rounded-md text-color-main  transition-colors p-2`}
        >
          <RiShieldUserLine className="text-2xl" />
          <span style={{ color: matchPath('/admin/socios') ? 'white !important' : 'inherit' }}>Socios</span>
        </Link>

        {/* motorizados */}
        <Link
        href={'/admin/motorizado'}
        className={`${matchPath('/admin/motorizado') ? activeStyles : hoverStyles} flex gap-2 rounded-md text-color-main transition-colors p-2`}
        >
             <RiRidingFill className="text-2xl" />
            <span style={{color : matchPath('/admin/motorizado') ? 'white !important': 'inherit'}}> motorizados</span>
        </Link>
      
      </nav>
    </div>
  )
}
