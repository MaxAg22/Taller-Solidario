import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useDeleteUser } from "@/hooks";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { Button } from "@/components/ui/button";
import type { AttendanceUser } from "@/interfaces";
import { UserFormModal } from "./UserFormModal";

export function UserActions({ id, name }: AttendanceUser) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { mutate, isPending } = useDeleteUser();
  return (
    <>
      <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        className="size-7 text-muted-foreground hover:text-primary"
        aria-label={`Editar alumno ${name}`}
        title="Editar nombre"
        disabled={isPending}
        onClick={() => setIsEditing(true)}
      >
        <Pencil aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="size-7 text-muted-foreground hover:text-destructive"
        aria-label={`Eliminar alumno ${name}`}
        title="Eliminar alumno"
        disabled={isPending}
        onClick={() => setConfirmId(String(id))}
      >
        <Trash2 aria-hidden="true" />
      </Button>
      </div>
      {isEditing && <UserFormModal user={{ id, name }} onClose={() => setIsEditing(false)} />}
      <ConfirmModal
        confirmDeleteId={confirmId}
        setConfirmDeleteId={setConfirmId}
        title="Eliminar alumno"
        description={`Se eliminará a ${name} y su historial de asistencias. Esta acción no se puede deshacer.`}
        isPending={isPending}
        handleDeleteNotebook={() => mutate(id, { onSuccess: () => setConfirmId(null) })}
      />
    </>
  );
}
