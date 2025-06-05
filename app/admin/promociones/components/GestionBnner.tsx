// app\admin\promociones\components\GestionBnner.tsx"use client"
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Eye, Search } from 'lucide-react'
import { FormularioBanner } from "./FormularioBanner"
import { VistaPreviaBanner } from "./VistaPreviaBanner"
import { useBannersQuery, useBannerMutations, useImageFormatter } from "../hooks/useBannersQuery"
import type { Banner } from "../types/banner.types"
import { Input } from "@/components/ui/input"
import { useDebounce } from "../hooks/use-debounce" 
import Swal from "sweetalert2"
// import { Switch } from "@/components/ui/switch"
// import { Label } from "@/components/ui/label"
export default function GestionBanner() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 500)
//   const [showAllBanners, setShowAllBanners] = useState(true)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)

  const { data, isLoading, isFetching } = useBannersQuery(page, limit, debouncedSearch /* showAllBanners*/)
  const { deleteBanner } = useBannerMutations()
  const formatImageUrl = useImageFormatter()

  const handleOpenDialog = (banner?: Banner) => {
    setSelectedBanner(banner || null)
    setIsDialogOpen(true)
  }

  const handlePreview = (banner: Banner) => {
    setSelectedBanner(banner)
    setPreviewOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedBanner(null)
  }

const handleDeleteBanner = async (id: number) => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "¿Deseas eliminar este banner?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      deleteBanner(id).then(() => {
        Swal.fire(
          '¡Eliminado!',
          'El banner ha sido eliminado correctamente.',
          'success'
        );
      }).catch((error) => {
        Swal.fire(
          'Error',
          'No se pudo eliminar el banner: ' + error.message,
          'error'
        );
      });
    }
  });
};

  const banners = data?.data || []
  const total = data?.total || 0
  const lastPage = Math.ceil(total / limit)

  // Calcular el índice inicial y final para la página actual
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const bannersToShow = banners.slice(startIndex, endIndex)
  
  const startItem = startIndex + 1
  const endItem = Math.min(startIndex + bannersToShow.length, total)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lista de Promociones</h2>
        <Button onClick={() => handleOpenDialog()} className="bg-red-500 hover:bg-red-600">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Banner
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar banners..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* <div className="flex items-center space-x-2 mt-4">
    <Switch
      id="showAllBanners"
      checked={showAllBanners}
      onCheckedChange={setShowAllBanners}
    />
    <Label htmlFor="showAllBanners">Mostrar banners inactivos</Label>
  </div> */}

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bannersToShow.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                      No hay banners disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  bannersToShow.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell className="font-medium">{banner.titulo}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded border" style={{ backgroundColor: banner.color_fondo }} />
                          {banner.color_fondo}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            banner.estado ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {banner.estado ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handlePreview(banner)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleOpenDialog(banner)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => banner.id && handleDeleteBanner(banner.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                {total > 0 
                  ? `Mostrando ${startItem} a ${endItem} de ${total} banners` 
                  : "No hay banners disponibles"}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-2">
                  Página {page} de {lastPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === lastPage || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <FormularioBanner
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        banner={selectedBanner}
        onClose={handleCloseDialog}
      />

      <VistaPreviaBanner
        isOpen={previewOpen}
        onOpenChange={setPreviewOpen}
        banner={selectedBanner}
        formatImageUrl={formatImageUrl}
      />
    </div>
  )
}