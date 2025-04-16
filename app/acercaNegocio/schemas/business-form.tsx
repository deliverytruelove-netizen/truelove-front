// app\acercaNegocio\schemas\business-form.tsx
import * as z from "zod";

export const formSchema = z.object({
  businessName: z.string().min(2, "El nombre del negocio es requerido"),
  businessType: z.string().min(1, "El tipo de negocio es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  branches: z.coerce.number().min(1, "El número de sucursales es requerido"),
  isStreetLocation: z.enum(["Si", "No"]),
  contactMethod: z.string().min(1, "El método de contacto es requerido"),
  phoneNumber: z.string().regex(/^\+51\d{9}$/, "Número de teléfono inválido"),
});

export type BusinessFormValues = z.infer<typeof formSchema>;

