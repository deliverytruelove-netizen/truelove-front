/**
 * Construye la URL completa de una imagen de tipo de negocio
 * Maneja tanto rutas completas guardadas en BD como solo nombres de archivo
 *
 * @param imagePath - La ruta de la imagen desde la BD (puede ser '/img/categories/nombre.png' o solo 'nombre.png')
 * @returns La URL completa de la imagen o null si no hay imagen
 */
export const getTipoNegocioImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null

  const API_BASE = process.env.NEXT_PUBLIC_API_WEB?.replace('/api', '') || ''

  // Si la imagen ya contiene la ruta completa (/img/categories/...), usarla directamente
  if (imagePath.startsWith('/img/') || imagePath.startsWith('img/')) {
    return `${API_BASE}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
  }

  // Si es solo el nombre del archivo, agregar el prefijo de la carpeta
  return `${API_BASE}/img/categories/${imagePath}`
}
