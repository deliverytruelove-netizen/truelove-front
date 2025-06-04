// app/admin/usuarios/services/DeletionRequest.service.ts
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_WEB

export interface DeletionRequest {
  id: number
  user_id: number
  reason: string
  status: string
  requested_at: string
  user: {
    id: number
    name: string
    email: string
    usuario: string
  }
}

export const fetchDeletionRequests = async (): Promise<DeletionRequest[]> => {
  const token = localStorage.getItem("authToken")
  
  if (!token) {
    throw new Error("No token found")
  }

  const response = await axios.get(`${API_URL}/admin/deletion-requests`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  return response.data
}

export const approveDeletionRequest = async (requestId: number): Promise<void> => {
  const token = localStorage.getItem("authToken")
  
  if (!token) {
    throw new Error("No token found")
  }

  await axios.post(`${API_URL}/admin/deletion-requests/${requestId}/approve`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
}