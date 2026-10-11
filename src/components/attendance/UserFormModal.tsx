import { useState, type FormEvent } from "react";
import { useCreateUser, useUpdateUser } from "@/hooks";
import type { AttendanceUser } from "@/interfaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function UserFormModal({ user, onClose }: { user?: AttendanceUser; onClose: () => void }) {
  const [name, setName] = useState(user?.name ?? "");
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const isPending = createUser.isPending || updateUser.isPending;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || isPending) return;
    if (user) updateUser.mutate({ id: user.id, name: name.trim() }, { onSuccess: onClose });
    else createUser.mutate(name.trim(), { onSuccess: onClose });
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !isPending) onClose(); }}>
      <DialogContent className="rounded-sm bg-card shadow-none sm:max-w-sm" showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{user ? "Editar alumno" : "Agregar alumno"}</DialogTitle>
          <DialogDescription>{user ? "Modificá el nombre del alumno." : "Ingresá el nombre para incluirlo en la planilla."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="attendance-user-name">Nombre</Label>
            <Input
              id="attendance-user-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={255}
              required
              disabled={isPending}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "Guardando…" : user ? "Guardar cambios" : "Agregar alumno"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
