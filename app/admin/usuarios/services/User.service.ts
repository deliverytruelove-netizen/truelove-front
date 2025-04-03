// app\admin\usuarios\services\User.service.ts
import axios from "axios"
import type { User } from "../types/User.types"

const API_URL = process.env.NEXT_PUBLIC_API_WEB

export const fetchUsers = async (): Promise<User[]> => {
  // Obtén el token del almacenamiento local o de las cookies
  const token = localStorage.getItem("authToken") // O usa cookies si es el caso

  // Si no hay token, puedes lanzar un error o manejarlo de otra manera
  if (!token) {
    throw new Error("No token found")
  }

  // Realiza la solicitud fetch con el token en los encabezados
  // Cambiamos a axios para mejor manejo de errores
  const response = await axios.get(API_URL + "/admin/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  // Verifica si la respuesta fue correcta
  if (response.status !== 200) {
    throw new Error("Network response was not ok")
  }

  return response.data
}

export const changeStateUser = async (usuario: number): Promise<void> => {
  // Obtén el token desde el localStorage o las cookies
  const token = localStorage.getItem("authToken") // O usa cookies si es el caso

  if (!token) {
    throw new Error("No token found")
  }

  await axios.post(
    API_URL + `/admin/users/change/state/${usuario}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`, // Agregar el token Bearer
        "Content-Type": "application/json", // Establecer tipo de contenido si es necesario
      },
    },
  )
}

export const createUser = async (newUser: {
  name: string
  email: string
  usuario: string
  password: string
  role_id?: number
}): Promise<void> => {
  // Obtén el token desde el localStorage o las cookies
  const token = localStorage.getItem("authToken") // O usa cookies si es el caso

  if (!token) {
    throw new Error("No token found")
  }

  // Asegurarse de que el role_id sea 1 (administrador) si no se especifica
  const userData = {
    ...newUser,
    role_id: newUser.role_id || 1,
  }

  await axios.post(API_URL + "/admin/users/create", userData, {
    headers: {
      Authorization: `Bearer ${token}`, // Agregar el token Bearer
      "Content-Type": "application/json", // Establecer tipo de contenido si es necesario
    },
  })
}

export const deleteUser = async (userId: number): Promise<void> => {
  // Obtén el token desde el localStorage o las cookies
  const token = localStorage.getItem("authToken")

  if (!token) {
    throw new Error("No token found")
  }

  await axios.delete(API_URL + `/admin/users/delete/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
}

