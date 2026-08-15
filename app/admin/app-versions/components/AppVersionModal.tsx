"use client"

import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, Save, Loader2, Smartphone, Apple } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateAppVersion } from "@/app/admin/app-versions/services/AppVersion.service"
import { showAlert } from "@/components/ui/DataTable/Alert"
import type { AppVersion } from "@/app/admin/app-versions/types/AppVersion.types"

interface AppVersionModalProps {
  appVersion: AppVersion | null
  isOpen: boolean
  onClose: () => void
}

const APP_NAME_LABELS: Record<string, string> = {
  cliente: "App Cliente",
  socio: "App Socio",
  motorizado: "App Motorizado",
}

const AppVersionModal: React.FC<AppVersionModalProps> = ({ appVersion, isOpen, onClose }) => {
  const queryClient = useQueryClient()

  const [minVersionAndroid, setMinVersionAndroid] = useState("")
  const [latestVersionAndroid, setLatestVersionAndroid] = useState("")
  const [forceUpdateAndroid, setForceUpdateAndroid] = useState(false)
  const [urlAndroid, setUrlAndroid] = useState("")

  const [minVersionIos, setMinVersionIos] = useState("")
  const [latestVersionIos, setLatestVersionIos] = useState("")
  const [forceUpdateIos, setForceUpdateIos] = useState(false)
  const [urlIos, setUrlIos] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !appVersion) return

    setMinVersionAndroid(appVersion.min_version_android ?? appVersion.min_version ?? "")
    setLatestVersionAndroid(appVersion.latest_version_android ?? appVersion.latest_version ?? "")
    setForceUpdateAndroid(appVersion.force_update_android ?? appVersion.force_update ?? false)
    setUrlAndroid(appVersion.url_android ?? "")

    setMinVersionIos(appVersion.min_version_ios ?? appVersion.min_version ?? "")
    setLatestVersionIos(appVersion.latest_version_ios ?? appVersion.latest_version ?? "")
    setForceUpdateIos(appVersion.force_update_ios ?? appVersion.force_update ?? false)
    setUrlIos(appVersion.url_ios ?? "")

    setErrors({})
  }, [isOpen, appVersion])

  const updateMutation = useMutation({
    mutationFn: (data: Partial<AppVersion>) => updateAppVersion({ id: appVersion!.id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-versions"] })
      showAlert({ title: "Éxito", text: "Versión actualizada correctamente.", icon: "success" })
      onClose()
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
    },
  })

  const isValidSemver = (value: string) => /^\d+\.\d+\.\d+$/.test(value.trim())

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!isValidSemver(minVersionAndroid)) newErrors.minVersionAndroid = "Formato inválido (ej: 1.0.0)"
    if (!isValidSemver(latestVersionAndroid)) newErrors.latestVersionAndroid = "Formato inválido (ej: 1.0.0)"
    if (!isValidSemver(minVersionIos)) newErrors.minVersionIos = "Formato inválido (ej: 1.0.0)"
    if (!isValidSemver(latestVersionIos)) newErrors.latestVersionIos = "Formato inválido (ej: 1.0.0)"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    updateMutation.mutate({
      min_version: minVersionAndroid.trim(),
      latest_version: latestVersionAndroid.trim(),
      force_update: forceUpdateAndroid,
      min_version_android: minVersionAndroid.trim(),
      latest_version_android: latestVersionAndroid.trim(),
      force_update_android: forceUpdateAndroid,
      url_android: urlAndroid.trim() || null,
      min_version_ios: minVersionIos.trim(),
      latest_version_ios: latestVersionIos.trim(),
      force_update_ios: forceUpdateIos,
      url_ios: urlIos.trim() || null,
    })
  }

  if (!isOpen || !appVersion) return null

  const isLoading = updateMutation.isPending

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-white w-full sm:rounded-xl shadow-2xl sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-brand-500 to-rose-500 sm:rounded-t-xl flex-shrink-0">
          <div>
            <h2 className="text-white font-semibold text-lg">
              {APP_NAME_LABELS[appVersion.app_name] ?? appVersion.app_name}
            </h2>
            <p className="text-white/80 text-xs mt-0.5">Configuración de versiones por plataforma</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Android */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-semibold text-gray-700">Android</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-gray-600">Versión Mínima</Label>
                  <Input
                    value={minVersionAndroid}
                    onChange={e => setMinVersionAndroid(e.target.value)}
                    placeholder="1.0.0"
                    className={`mt-1 h-9 text-sm ${errors.minVersionAndroid ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.minVersionAndroid && <p className="text-red-500 text-xs mt-1">{errors.minVersionAndroid}</p>}
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Versión Más Reciente</Label>
                  <Input
                    value={latestVersionAndroid}
                    onChange={e => setLatestVersionAndroid(e.target.value)}
                    placeholder="1.0.0"
                    className={`mt-1 h-9 text-sm ${errors.latestVersionAndroid ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.latestVersionAndroid && <p className="text-red-500 text-xs mt-1">{errors.latestVersionAndroid}</p>}
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-600">URL Play Store</Label>
                <Input
                  value={urlAndroid}
                  onChange={e => setUrlAndroid(e.target.value)}
                  placeholder="https://play.google.com/store/apps/details?id=..."
                  className="mt-1 h-9 text-sm"
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-gray-600">Forzar actualización</Label>
                <Switch checked={forceUpdateAndroid} onCheckedChange={setForceUpdateAndroid} disabled={isLoading} />
              </div>
            </div>
          </div>

          {/* iOS */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <Apple className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-semibold text-gray-700">iOS</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-gray-600">Versión Mínima</Label>
                  <Input
                    value={minVersionIos}
                    onChange={e => setMinVersionIos(e.target.value)}
                    placeholder="1.0.0"
                    className={`mt-1 h-9 text-sm ${errors.minVersionIos ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.minVersionIos && <p className="text-red-500 text-xs mt-1">{errors.minVersionIos}</p>}
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Versión Más Reciente</Label>
                  <Input
                    value={latestVersionIos}
                    onChange={e => setLatestVersionIos(e.target.value)}
                    placeholder="1.0.0"
                    className={`mt-1 h-9 text-sm ${errors.latestVersionIos ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.latestVersionIos && <p className="text-red-500 text-xs mt-1">{errors.latestVersionIos}</p>}
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-600">URL App Store</Label>
                <Input
                  value={urlIos}
                  onChange={e => setUrlIos(e.target.value)}
                  placeholder="https://apps.apple.com/app/id..."
                  className="mt-1 h-9 text-sm"
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-gray-600">Forzar actualización</Label>
                <Switch checked={forceUpdateIos} onCheckedChange={setForceUpdateIos} disabled={isLoading} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer fijo con acciones */}
        <div className="flex items-center justify-end gap-2 px-4 sm:px-6 py-4 border-t border-gray-100 bg-white flex-shrink-0">
          <Button
            type="button" variant="outline" onClick={onClose}
            className="h-9 text-sm" disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-brand-500 hover:bg-brand-600 text-white h-9 text-sm px-5"
            disabled={isLoading}
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Guardar</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default AppVersionModal
