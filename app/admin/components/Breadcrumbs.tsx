'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { RiHome2Line } from 'react-icons/ri'

/**
 * Get absolute path from current path and path
 * @param currentPath current path
 * @param path path
 * @returns absolute path
 */
const getAbsolutePath = (currentPath: string, path: string): string => {
  const currentAbsolutePath = currentPath.split('/').slice(0, -1).join('/')
  return `${currentAbsolutePath}/${path}`
}

export const Breadcrumbs: React.FC = () => {
  const pathname = usePathname()
  return (
    <div className="py-4 font-medium text-md text-color-main/70 flex items-center gap-1 px-2">
      <span>
        <Link
          href='#'
          className="hover:text-color-main transition-colors"
        >
          <RiHome2Line className="text-md" />
        </Link>
      </span>
      {pathname
        .split('/')
        .slice(1)
        .map((path, index) => {
          return (
            <span key={index} className="flex gap-1 items-center group">
              <span className="group-hover:text-color-main">/</span>
              <Link
                href={getAbsolutePath(pathname, path)}
                className="group-hover:text-color-main transition-colors"
              >
              </Link>
            </span>
          )
        })}
    </div>
  )
}
