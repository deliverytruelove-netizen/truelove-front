// app\admin\components\layout\Header\AvatarSettings.tsx
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { UserCircle, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

const AvatarSettings: React.FC = () => {
  // Estados para manejar el menú y la información del usuario
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [userInitials, setUserInitials] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const router = useRouter();

  // Efecto para cargar la información del usuario
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const firstName = user?.name || '';
      const lastName = user?.lastName || '';
      setFullName(`${firstName} ${lastName}`.trim());
      setEmail(user?.email || '');
      setUserInitials(`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase());
    }
  }, []);

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  // Efecto para cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center font-medium">
          {userInitials}
        </div>
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={showMenu ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className={`absolute right-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden ${
          showMenu ? 'block' : 'hidden'
        }`}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-gray-100">{fullName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{email}</p>
        </div>

        <div className="p-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <UserCircle className="h-5 w-5" />
            <span>Perfil</span>
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Settings className="h-5 w-5" />
            <span>Configuración</span>
          </button>
        </div>

        <div className="p-2 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AvatarSettings;