// app\acercaNegocio\components\Fomurlulario.tsx
"use client";

import { useEffect } from "react";
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
import type { TipoNegocio, Categoria } from "../types/business";
import { UseFormReturn } from "react-hook-form";
import { PhoneInput } from "./phone-input";

interface BusinessFormProps {
  form: UseFormReturn<BusinessFormValues>;
  tiposNegocio: TipoNegocio[];
  categorias: Categoria[];
  fetchCategorias: (tipoNegocioId: string) => void;
}

export function BusinessForm({
  form,
  tiposNegocio,
  categorias,
  fetchCategorias,
}: BusinessFormProps) {
  const { watch, setValue } = form;
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
          name="businessType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Negocio *</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  fetchCategorias(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione tipo de negocio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tiposNegocio.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem
                      key={categoria.id}
                      value={categoria.id.toString()}
                    >
                      {categoria.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
                <FormLabel>Número de Teléfono del Negocio *</FormLabel>
                <FormControl>
                  <PhoneInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="+51 999-999-999"
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">
                  El número debe comenzar con +51 seguido de 9 dígitos
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
    render={({ field }) => (
      <FormItem>
        <FormLabel>
          Número de {digitalWallet === "1" ? "Yape" : "Plin"}
        </FormLabel>
        <FormControl>
          <Input {...field} placeholder="999999999" />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
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
          </div>
        )}
      </form>
    </Form>
  );
}

