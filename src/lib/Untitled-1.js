import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns"; // Opcional, para formatear bonito el botón de fecha
import { CalendarIcon, X, ChevronDownIcon } from "lucide-react"; // Iconos

// Componentes de UI
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils"; // Utilidad clásica de shadcn

// Tipos y Hooks
import type { OrderFormModalProps } from "@/interfaces";
import { useCreateOrder } from "@/hooks/orders/useCreateOrder";
// Importar el schema de arriba o definirlo aquí mismo

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  order,
  onSave,
  onClose,
}) => {
  const { mutate: createOrder, isPending: isPendingCreate } = useCreateOrder({
    onSuccess: () => onSave(),
  });

  // 1. Inicializar el formulario con react-hook-form
  const form =
    useForm <
    OrderFormValues >
    {
      resolver: zodResolver(orderSchema),
      defaultValues: {
        name: order?.name || "",
        description: order?.description || "",
        status: order?.status || "Pendiente",
        // Convertir a string vacío si es 0 para que el placeholder se vea (opcional)
        totalNotebooks: order?.totalNotebooks || 0,
        readyNotebooks: order?.readyNotebooks || 0,
        // Importante: Convertir string de fecha a objeto Date si existe
        deadline: order?.deadline ? new Date(order.deadline) : undefined,
      },
    };

  // 2. Manejar el envío
  const onSubmit = (data: OrderFormValues) => {
    const isEdit = !!order?.id;

    // Preparamos el objeto para enviar al backend
    // Convertimos el Date object a string YYYY-MM-DD
    const payload = {
      ...data,
      deadline: data.deadline.toISOString().split("T")[0],
    };

    if (isEdit) {
      // Lógica de editar...
      // updateOrder({ id: order.id, ...payload })
      console.log("Editando", payload);
    } else {
      createOrder(payload);
      console.log("Creando", payload);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>
                    {order ? "Editar Orden" : "Agregar Nueva Orden"}
                  </CardTitle>
                  <CardDescription>
                    {order
                      ? "Modifica los detalles de la orden seleccionada."
                      : "Completa la información de la orden que ingresa al taller."}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CAMPO NOMBRE */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Orden para PUC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CAMPO DESCRIPCIÓN (Opcional) */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Preparar 15 notebooks..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CAMPO ESTADO */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="Lista">Lista</SelectItem>
                        <SelectItem value="Entregada">Entregada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CAMPO TOTAL NOTEBOOKS */}
              <FormField
                control={form.control}
                name="totalNotebooks"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notebooks a entregar *</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CAMPO READY NOTEBOOKS */}
              <FormField
                control={form.control}
                name="readyNotebooks"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notebooks listas *</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CAMPO FECHA (Date Picker) */}
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel>Fecha de entrega *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              field.value.toLocaleDateString()
                            ) : (
                              <span>Selecciona una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange} // Conecta el calendario con Zod
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} type="button">
                Cancelar
              </Button>

              {/* El botón deshabilita si hay envío pendiente */}
              <Button type="submit" disabled={isPendingCreate}>
                {isPendingCreate ? (
                  <>
                    <Spinner className="mr-2" /> Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};
