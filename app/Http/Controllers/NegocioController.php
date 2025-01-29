<?php

namespace App\Http\Controllers;

use App\Models\Negocio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NegocioController extends Controller
{
    public function show($businessRegistrationId)
    {
        try {
            $negocio = Negocio::where('business_registration_id', $businessRegistrationId)
                ->first();
            
            if (!$negocio) {
                return response()->json(['message' => 'Negocio no encontrado'], 404);
            }

            return response()->json($negocio);
        } catch (\Exception $e) {
            Log::error('Error al obtener negocio: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener los datos del negocio'], 500);
        }
    }
} 