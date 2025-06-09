// app/admin/horarios/page.tsx
"use client"

import MainLayout from "../components/MainLayout"
import { HorariosManager } from "./components/HorariosManager"


export default function Horarios() {

  return (
    <MainLayout>
      <HorariosManager/>
    </MainLayout>
  )
}