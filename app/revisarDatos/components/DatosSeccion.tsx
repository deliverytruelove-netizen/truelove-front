import { Button } from "@/components/ui/button"

interface ReviewSectionProps {
  title: string
  onEdit: () => void
  data: Record<string, string | boolean | number | null>
}

export function DatosSeccion({ title, onEdit, data }: ReviewSectionProps) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <Button 
          variant="link" 
          className="text-pink-600 hover:text-pink-700 font-medium p-0 h-auto"
          onClick={onEdit}
        >
          Editar
        </Button>
      </div>
      <div className="grid gap-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <span className="text-sm text-muted-foreground font-medium">
              {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:
            </span>
            <span className="text-sm text-gray-900">
              {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value || 'No especificada'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}