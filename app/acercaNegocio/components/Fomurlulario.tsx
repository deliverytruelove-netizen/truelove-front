
"use client";

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
import { type BusinessFormValues } from "../schemas/business-form";
import type { TipoNegocio, Categoria } from "../types/business";
import { UseFormReturn } from "react-hook-form";

interface BusinessFormProps {
  form: UseFormReturn<BusinessFormValues>;
  tiposNegocio: TipoNegocio[];
  categorias: Categoria[];
  fetchCategorias: (tipoNegocioId: string) => void;
}

export function BusinessForm({ form, tiposNegocio, categorias, fetchCategorias }: BusinessFormProps) {
  return (
    <Form {...form}>
      <form className="space-y-6 h-screen  ">
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
                    <SelectItem
                      key={tipo.id}
                      value={tipo.id.toString()}
                    >
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
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
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
          name="isStreetLocation"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>
                ¿Es un local con acceso a la calle? *
              </FormLabel>
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

        <FormField
          control={form.control}
          name="contactMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de contacto preferido *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
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

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Teléfono del Negocio *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="+51123456789" />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-muted-foreground">
                El número debe comenzar con +51 seguido de 9 dígitos
              </p>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

