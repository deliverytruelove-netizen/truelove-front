const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_WEB}/documento`;

export async function fetchDocumentInfo(type: 'dni' | 'ruc', number: string) {
  const url = `${API_BASE_URL}/${type}/${number}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Verify the response format based on document type
    if (type === 'dni') {
      if (!data.success) {
        throw new Error(data.message || 'No se encontraron datos para el DNI proporcionado');
      }
      return {
        nombres: data.nombres,
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno
      };
    } else {
      // RUC response
      if (!data.ruc) {
        throw new Error('No se encontraron datos para el RUC proporcionado');
      }
      return {
        ruc: data.ruc,
        razonSocial: data.razonSocial,
        estado: data.estado,
        condicion: data.condicion
      };
    }
  } catch (error) {
    console.error('Error al obtener la información del documento:', error);
    throw new Error('No se pudo obtener la información del documento. Por favor, inténtelo de nuevo más tarde.');
  }
}