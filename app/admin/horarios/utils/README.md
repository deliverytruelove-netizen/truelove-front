# Utilidades de Formato de Tiempo

Este módulo proporciona funciones para convertir entre formatos de 12 y 24 horas.

## Funciones Disponibles

### `format24to12(time24: string): string`
Convierte hora de formato 24h a 12h con AM/PM.

**Ejemplo:**
```typescript
format24to12("14:30") // "02:30 PM"
format24to12("08:00") // "08:00 AM"
format24to12("00:00") // "12:00 AM"
format24to12("12:00") // "12:00 PM"
```

### `format12to24(time12: string): string`
Convierte hora de formato 12h con AM/PM a 24h.

**Ejemplo:**
```typescript
format12to24("02:30 PM") // "14:30"
format12to24("08:00 AM") // "08:00"
format12to24("12:00 AM") // "00:00"
format12to24("12:00 PM") // "12:00"
```

### `generateTimeOptions12h(interval?: number): string[]`
Genera array de horas en formato 12h con AM/PM.

**Ejemplo:**
```typescript
generateTimeOptions12h(15) // ["12:00 AM", "12:15 AM", ..., "11:45 PM"]
```

### `generateTimeOptions24h(interval?: number): string[]`
Genera array de horas en formato 24h.

**Ejemplo:**
```typescript
generateTimeOptions24h(15) // ["00:00", "00:15", ..., "23:45"]
```

## Uso en Componentes

### TimeSelector
El componente `TimeSelectorMejorado` ahora:
- **Muestra** las horas en formato 12h (AM/PM) al usuario
- **Almacena y envía** las horas en formato 24h al backend
- Convierte automáticamente entre formatos

### GruposList y CalendarioVista
Estos componentes ahora muestran las horas en formato 12h (AM/PM) para mejor legibilidad.

## Flujo de Datos

```
Usuario ve: "02:30 PM"
    ↓
Componente almacena: "14:30"
    ↓
Backend recibe: "14:30"
    ↓
Backend responde: "14:30"
    ↓
Componente muestra: "02:30 PM"
```

## Notas Importantes

- El backend **siempre** trabaja con formato 24h (HH:mm)
- La conversión es **solo visual** en el frontend
- Los datos se almacenan en formato 24h en la base de datos
- La conversión es **bidireccional** y **sin pérdida de información**
