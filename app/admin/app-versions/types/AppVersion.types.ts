export interface AppVersion {
  id: number
  app_name: string
  min_version: string
  min_version_android: string | null
  min_version_ios: string | null
  latest_version: string
  latest_version_android: string | null
  latest_version_ios: string | null
  force_update: boolean
  force_update_android: boolean
  force_update_ios: boolean
  url_android: string | null
  url_ios: string | null
  created_at?: string
  updated_at?: string
}

export interface AppVersionApiResponse {
  success: boolean
  data?: AppVersion | AppVersion[]
  message?: string
  errors?: Record<string, string[]>
}
