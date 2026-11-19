import type { ReactNode } from "react";
import { X } from "lucide-react";
import { CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

interface FormModalProps {
  contentClassName: string;
  title: string;
  description: string;
  isPending: boolean;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}

export function FormModal({
  contentClassName,
  title,
  description,
  isPending,
  submitLabel,
  onClose,
  onSubmit,
  children,
}: FormModalProps) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent showCloseButton={false} className={contentClassName}>
        <form onSubmit={onSubmit}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-[26px] leading-tight">
                  {title}
                </DialogTitle>
                <DialogDescription className="mt-2">
                  {description}
                </DialogDescription>
              </div>
              <Button
                aria-label="Cerrar formulario"
                variant="ghost"
                size="icon"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          {children}
          <CardFooter className="flex justify-end gap-3 border-t py-6">
            <Button variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner />}
              {submitLabel}
            </Button>
          </CardFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
