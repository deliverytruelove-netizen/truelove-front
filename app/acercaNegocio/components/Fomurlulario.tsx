// app\acercaNegocio\components\Fomurlulario.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { QrCode, Upload, Trash2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { type BusinessFormValues } from "../schemas/business-form";
import { UseFormReturn } from "react-hook-form";
import { PhoneInput } from "./phone-input";

interface BusinessFormProps {
  form: UseFormReturn<BusinessFormValues>;
  qrPreview: string | null;
  onQrSelect: (file: File) => void;
  onQrRemove: () => void;
}

const QR_TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
const QR_TAMANO_MAXIMO = 2 * 1024 * 1024;

export function BusinessForm({
  form,
  qrPreview,
  onQrSelect,
  onQrRemove,
}: BusinessFormProps) {
  const { watch, setValue } = form;
  const qrInputRef = useRef<HTMLInputElement>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  const handleQrChange = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!archivo) return;

    if (!QR_TIPOS_PERMITIDOS.includes(archivo.type)) {
      setQrError("Solo se permiten archivos JPG, PNG y GIF.");
      return;
    }
    if (archivo.size > QR_TAMANO_MAXIMO) {
      setQrError("El archivo es demasiado grande. Máximo 2MB permitido.");
      return;
    }

    setQrError(null);
    onQrSelect(archivo);
  };
  const digitalWallet = watch("digitalWallet");
  const useSamePhone = watch("useSamePhone");
  const mainPhoneNumber = watch("phoneNumber");

  useEffect(() => {
   if (digitalWallet && digitalWallet !== "0") {

      if (form.getValues("useSamePhone") === undefined) {
        setValue("useSamePhone", true);
      }
    } else {
      setValue("useSamePhone", undefined);
      setValue("walletNumber", undefined);
    }
  }, [digitalWallet, setValue, form]);

  return (
    <Form {...form}>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Negocio *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="branches"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Sucursales *</FormLabel>
              <FormControl>
                <Input {...field} type="number" min="1" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de contacto preferido *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione método de contacto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Llamada">Llamada</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="isStreetLocation"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>¿Es un local con acceso a la calle? *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="Si" />
                      </FormControl>
                      <FormLabel className="font-normal">Sí</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="No" />
                      </FormControl>
                      <FormLabel className="font-normal">No</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono del Negocio</FormLabel>
                <FormControl>
                  <PhoneInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="+51 999-999-999"
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">
                  Se usará el número registrado. Puede cambiarlo si el negocio tiene otro número.
                </p>
              </FormItem>
            )}
          />
        </div>

        <div className="md:col-span-2 space-y-2 pt-4 border-t">
          <h3 className="text-md font-semibold">Pagos con Billetera Digital</h3>
          <p className="text-sm text-muted-foreground">
            Configure si acepta pagos a través de Yape o Plin.
          </p>
        </div>

        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="digitalWallet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>¿Aceptas pagos con billeteras digitales?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una opción" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">No acepto</SelectItem>
                    <SelectItem value="1">Yape</SelectItem>
                    <SelectItem value="2">Plin</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {digitalWallet && digitalWallet !== "0" && (
          <div className="md:col-span-2 space-y-4">
            <FormField
              control={form.control}
              name="useSamePhone"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Usar mi número de teléfono registrado ({mainPhoneNumber}) para
                      recibir los pagos.
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

         {!useSamePhone && (
  <FormField
    control={form.control}
    name="walletNumber"
    render={({ field }) => {
      const hasError = field.value && !/^\d{9}$/.test(field.value);
      return (
        <FormItem>
          <FormLabel>
            Número de {digitalWallet === "1" ? "Yape" : "Plin"} *
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              placeholder="999999999"
              maxLength={9}
              className={hasError ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
          </FormControl>
          {hasError && (
            <p className="text-sm text-red-500 mt-1">
              El número debe tener exactamente 9 dígitos
            </p>
          )}
          <FormMessage />
        </FormItem>
      );
    }}
  />
)}

<FormField
  control={form.control}
  name="walletOwnerName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>
        Nombre del titular de {digitalWallet === "1" ? "Yape" : "Plin"}
      </FormLabel>
      <FormControl>
        <Input {...field} placeholder="Ingrese el nombre completo del titular" />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

            {/* QR de Yape/Plin (opcional) */}
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <QrCode className="h-4 w-4 text-muted-foreground" />
                QR de {digitalWallet === "1" ? "Yape" : "Plin"} (opcional)
              </p>
              <p className="text-sm text-muted-foreground">
                Si subes tu QR, los clientes lo verán directamente al pagar en vez de tu número.
              </p>

              {qrPreview ? (
                <div className="flex items-center gap-4 p-4 rounded-md border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrPreview}
                    alt="QR de pago digital"
                    className="w-24 h-24 rounded-md border bg-white object-contain shrink-0"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => qrInputRef.current?.click()}
                      className="text-xs font-semibold px-3 py-1.5 rounded-md border hover:bg-muted flex items-center gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Reemplazar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQrError(null);
                        onQrRemove();
                      }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-md border border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Quitar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => qrInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-md border-2 border-dashed hover:border-red-300 transition-colors"
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Subir imagen del QR</span>
                </button>
              )}

              {qrError && <p className="text-sm text-red-500">{qrError}</p>}

              <input
                ref={qrInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif"
                onChange={handleQrChange}
                className="hidden"
              />
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}

