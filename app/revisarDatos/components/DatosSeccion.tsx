import { Button } from "@/components/ui/button"

interface ReviewSectionProps {
  title: string
  onEdit: () => void
  data: Record<string, any>
}

export function DatosSeccion({ title, onEdit, data }: ReviewSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button 
          variant="link" 
          className="text-pink-600 hover:text-pink-700"
          onClick={onEdit}
        >
          Editar
        </Button>
      </div>
      <div className="grid gap-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="grid grid-cols-2 gap-2">
            <span className="text-sm text-muted-foreground">
              {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </span>
            <span className="text-sm font-medium">
              {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value || 'No especificada'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

