// app\acercaNegocio\components\Loading.tsx
export default function Loading() {
    return (
      <div className="fixed inset-0 bg-white backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#f34739] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg font-medium text-gray-900">Cargando...</p>
        </div>
      </div>
    );
  }
  
  