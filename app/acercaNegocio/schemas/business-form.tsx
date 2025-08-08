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
  digitalWallet: z.enum(["0", "1", "2"]),
  useSamePhone: z.boolean().optional(),
  walletNumber: z.string().optional(),
}).refine(data => {
  if ((data.digitalWallet === '1' || data.digitalWallet === '2') && !data.useSamePhone) {
    return data.walletNumber && /^\d{9}$/.test(data.walletNumber);
  }
  return true;
}, {
  message: "El número de billetera es requerido y debe tener 9 dígitos",
  path: ["walletNumber"],
});

export type BusinessFormValues = z.infer<typeof formSchema>;

