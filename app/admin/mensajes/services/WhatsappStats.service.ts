// app\admin\mensajes\services\WhatsappStats.service.ts
import axios from "axios"
import type { WhatsappStats } from "../types/WhatsappStats.types"

const API_URL = process.env.NEXT_PUBLIC_API_WEB

export const fetchWhatsappStats = async (): Promise<WhatsappStats> => {
  const token = localStorage.getItem("authToken")

  if (!token) {
    throw new Error("No token found")
  }

  const response = await axios.get(API_URL + "/admin/whatsapp/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (response.status !== 200 || !response.data?.success) {
    throw new Error("Network response was not ok")
  }

  return response.data.data
}
