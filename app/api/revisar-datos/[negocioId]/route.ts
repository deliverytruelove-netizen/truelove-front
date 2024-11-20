import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { negocioId: string } }
) {
  try {
    const { negocioId } = params
    const searchParams = request.nextUrl.searchParams
    const establecimientoId = searchParams.get('establecimiento_id')
    const datosClaveNegocioId = searchParams.get('datos_clave_negocio_id')
    const datosBancariosId = searchParams.get('datos_bancarios_id')

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/api/revisar-datos/${negocioId}?establecimiento_id=${establecimientoId}&datos_clave_negocio_id=${datosClaveNegocioId}&datos_bancarios_id=${datosBancariosId}`)
    
    if (!response.ok) {
      throw new Error('Error en la respuesta del backend')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener los datos' },
      { status: 500 }
    )
  }
}