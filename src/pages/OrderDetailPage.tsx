import { useCallback, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/shared/table/DataTable";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { OrderRemoveTeamModal } from "@/components/orders/OrderRemoveTeamModal";
import { orderNotebookColumns } from "@/components/orders/table/OrderNotebookColumns";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
} from "@/components/ui/multi-select";
import { useAvailableNotebooks } from "@/hooks/notebooks/useAvailableNotebooks";
import { useChangeOrderStatus } from "@/hooks/orders/useChangeOrderStatus";
import { useDeleteOrder } from "@/hooks/orders/useDeleteOrder";
import { useOrder } from "@/hooks/orders/useOrder";
import { useUpdateOrder } from "@/hooks/orders/useUpdateOrder";
import { formatDeliveryDate } from "@/utils/order";
import type {
  NotebookStatus,
  OrderDraft,
  OrderStatus,
  OrderTeam,
} from "@/interfaces";

type ConfirmKind = "leave" | "return-prep" | "delete" | null;

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { order, notebooks: orderNotebooks, isLoading, isError, refetch } = useOrder(id);
  const { notebooks: availableNotebooks } = useAvailableNotebooks();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<OrderDraft | null>(null);
  const [teamToRemove, setTeamToRemove] = useState<OrderTeam | null>(null);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);
  const [leaveTarget, setLeaveTarget] = useState<"cancel" | "back">("cancel");

  const { mutate: saveOrder, isPending: isSaving } = useUpdateOrder({
    onSuccess: () => {
      setIsEditing(false);
      setDraft(null);
    },
  });
  const { mutate: changeStatus, isPending: isChangingStatus } = useChangeOrderStatus();
  const { mutate: removeOrder, isPending: isDeleting } = useDeleteOrder();

  const status = (order?.status ?? "") as OrderStatus;
  const isDonated = status === "Donado";

  const hasChanges = useMemo(() => {
    if (!draft || !order) return false;

    return (
      draft.recipient !== order.recipient ||
      draft.deliveryDate !== order.deliveryDate ||
      (draft.description ?? "") !== (order.description ?? "") ||
      draft.attach.length > 0 ||
      draft.detach.length > 0
    );
  }, [draft, order]);

  const rows = useMemo<OrderTeam[]>(() => {
    const detachById = new Map(draft?.detach.map((item) => [item.notebookId, item.status] as const));

    const base: OrderTeam[] = (orderNotebooks ?? []).map((notebook) => ({
      id: notebook.id,
      name: [notebook.brand, notebook.model].filter(Boolean).join(" ") || "Equipo",
      serialNumber: notebook.serialNumber?.toString() ?? "",
      status: notebook.status ?? "",
      specs: notebook.specs ?? "",
      pending: detachById.has(notebook.id) ? ("Se quitará" as const) : null,
      removeStatus: detachById.get(notebook.id) ?? null,
    }));

    if (!draft) return base;

    const attached: OrderTeam[] = [];

    draft.attach.forEach((item) => {
      const notebook = (availableNotebooks ?? []).find(
        (candidate) => candidate.id === item.notebookId
      );

      if (!notebook) return;

      attached.push({
        id: notebook.id,
        name: [notebook.brand, notebook.model].filter(Boolean).join(" ") || "Equipo",
        serialNumber: notebook.serialNumber?.toString() ?? "",
        status: notebook.status ?? "",
        specs: notebook.specs ?? "",
        pending: "Pendiente",
        removeStatus: null,
      });
    });

    return [...base, ...attached];
  }, [orderNotebooks, draft, availableNotebooks]);

  const handleRemoveTeam = useCallback((notebook: OrderTeam) => {
    if (notebook.pending === "Pendiente") {
      setDraft((prev) =>
        prev ? { ...prev, attach: prev.attach.filter((item) => item.notebookId !== notebook.id) } : prev
      );
      return;
    }
    setTeamToRemove(notebook);
  }, []);

  const columns = useMemo(
    () => orderNotebookColumns(isEditing ? handleRemoveTeam : undefined),
    [isEditing, handleRemoveTeam]
  );

  const handleEdit = () => {
    if (!order) return;

    setDraft({
      recipient: order.recipient,
      deliveryDate: order.deliveryDate,
      description: order.description ?? "",
      attach: [],
      detach: [],
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!draft || !order) return;

    if (!draft.recipient.trim() || !draft.deliveryDate) {
      toast.error("Completá el destinatario y la fecha de entrega");
      return;
    }

    saveOrder({
      id: order.id,
      recipient: draft.recipient.trim(),
      deliveryDate: draft.deliveryDate,
      description: draft.description ? draft.description : null,
      attach: draft.attach,
      detach: draft.detach,
    });
  };

  const handleCancel = () => {
    if (!hasChanges) {
      setIsEditing(false);
      setDraft(null);
      return;
    }

    setLeaveTarget("cancel");
    setConfirmKind("leave");
  };

  const handleBack = () => {
    if (isEditing && hasChanges) {
      setLeaveTarget("back");
      setConfirmKind("leave");
      return;
    }

    navigate("/ordenes");
  };

  const handleConfirmRemoveTeam = (returnStatus: NotebookStatus) => {
    if (!draft || !teamToRemove) return;

    const team = teamToRemove;
    setDraft((prev) => {
      if (!prev) return prev;

      if (prev.attach.some((item) => item.notebookId === team.id)) {
        return { ...prev, attach: prev.attach.filter((item) => item.notebookId !== team.id) };
      }

      return {
        ...prev,
        detach: [
          ...prev.detach.filter((item) => item.notebookId !== team.id),
          { notebookId: team.id, status: returnStatus },
        ],
      };
    });
    setTeamToRemove(null);
  };

  const handleAttach = (values: string[]) => {
    setDraft((prev) =>
      prev
        ? { ...prev, attach: values.map((notebookId) => ({ notebookId })) }
        : prev
    );
  };

  if (isLoading) {
    return (
      <div className="inventory-page">
        <div className="orders-notice" role="status">
          <Spinner />
          <p>Cargando orden…</p>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="inventory-page">
        <div className="orders-notice" role="alert">
          <p>Error en la consulta. No se pudo cargar la orden.</p>
          <Button variant="outline" onClick={() => refetch()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  const teamsCount = rows.filter((team) => team.pending !== "Se quitará").length;

  return (
    <div className="inventory-page">
      <div className="inventory-heading">
        <div>
          <Button variant="ghost" className="orders-back" onClick={handleBack}>
            <ArrowLeft aria-hidden="true" /> Órdenes
          </Button>
          <h1>{order.recipient}</h1>
        </div>
        <div className="orders-actions">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
                {isSaving && <Spinner />}
                Guardar Cambios
              </Button>
            </>
          ) : isDonated ? (
            <Button variant="outline" onClick={() => setConfirmKind("return-prep")}>
              Volver a En Preparación
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleEdit}>
                Editar
              </Button>
              <Button
                onClick={() => changeStatus({ id: order.id, status: "Donado" })}
                disabled={isChangingStatus}
              >
                Marcar como Donado
              </Button>
              {(orderNotebooks ?? []).length === 0 && (
                <Button
                  variant="destructive"
                  disabled={isDonated}
                  onClick={() => setConfirmKind("delete")}
                >
                  Eliminar orden
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className={`orders-fields${isDonated ? " orders-fields-locked" : ""}`}>
        <div className="orders-field">
          <Label htmlFor="deliveryDate">Fecha de entrega</Label>
          {isEditing ? (
            <Input
              id="deliveryDate"
              type="date"
              value={draft?.deliveryDate ?? ""}
              onChange={(event) =>
                setDraft((prev) =>
                  prev ? { ...prev, deliveryDate: event.target.value } : prev
                )
              }
            />
          ) : (
            <span className="orders-value">{formatDeliveryDate(order.deliveryDate)}</span>
          )}
        </div>
        <div className="orders-field">
          <Label>Estado</Label>
          <span className="orders-value">
            <span className="inventory-table-status" data-status={status}>{status}</span>
          </span>
        </div>
        <div className="orders-field orders-field-wide">
          <Label htmlFor="description">Descripción</Label>
          {isEditing ? (
            <Textarea
              id="description"
              value={draft?.description ?? ""}
              onChange={(event) =>
                setDraft((prev) =>
                  prev ? { ...prev, description: event.target.value } : prev
                )
              }
            />
          ) : (
            <span className="orders-value">{order.description || "—"}</span>
          )}
        </div>
        {isDonated && (
          <p className="orders-locked-note" role="note">
            Esta orden está donada: no se pueden editar sus datos ni sus equipos. Usá «Volver a En Preparación» para habilitarla otra vez.
          </p>
        )}
      </div>

      <div className="orders-section-head">
        <div className="orders-section-head-left">
          <h2>
            Equipos asociados <span>({teamsCount})</span>
          </h2>
          {isEditing && (
            <MultiSelect
              values={draft?.attach.map((item) => item.notebookId) ?? []}
              onValuesChange={handleAttach}
            >
              <MultiSelectTrigger>Agregar equipo</MultiSelectTrigger>
              <MultiSelectContent
                search={{
                  placeholder: "Buscar por número de serie, modelo o nombre...",
                  emptyMessage: "No hay equipos disponibles",
                }}
                filter={(value: string, search: string) =>
                  search ? (value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0) : 1
                }
              >
                {(availableNotebooks ?? []).map((notebook) => (
                  <MultiSelectItem key={notebook.id} value={notebook.id}>
                    {`${[notebook.brand, notebook.model].filter(Boolean).join(" ")} · ${notebook.serialNumber}`}
                  </MultiSelectItem>
                ))}
              </MultiSelectContent>
            </MultiSelect>
          )}
        </div>
      </div>

      <div className="inventory-table-section">
        <DataTable
          columns={columns}
          data={rows}
          emptyMessage="No hay equipos disponibles"
        />
      </div>

      {teamToRemove && (
        <OrderRemoveTeamModal
          notebook={teamToRemove}
          onConfirm={handleConfirmRemoveTeam}
          onClose={() => setTeamToRemove(null)}
        />
      )}

      {confirmKind === "leave" && (
        <ConfirmModal
          id={order.id}
          onClose={() => setConfirmKind(null)}
          onConfirm={() => {
            setConfirmKind(null);
            setIsEditing(false);
            setDraft(null);
            if (leaveTarget === "back") navigate("/ordenes");
          }}
          confirmLabel="Salir sin guardar"
          destructive
          title="Se perderán los cambios"
          description="Si salís ahora, se descartarán las modificaciones sin guardar."
        />
      )}

      {confirmKind === "return-prep" && (
        <ConfirmModal
          id={order.id}
          onClose={() => setConfirmKind(null)}
          onConfirm={() =>
            changeStatus(
              { id: order.id, status: "En Preparación" },
              { onSuccess: () => setConfirmKind(null) }
            )
          }
          confirmLabel="Cambiar"
          title="Volver a En Preparación"
          description="Los equipos asociados volverán al estado Listo para donar y la orden podrá editarse otra vez."
          isPending={isChangingStatus}
        />
      )}

      {confirmKind === "delete" && (
        <ConfirmModal
          id={order.id}
          onClose={() => setConfirmKind(null)}
          onConfirm={() =>
            removeOrder(order.id, {
              onSuccess: () => {
                setConfirmKind(null);
                navigate("/ordenes");
              },
            })
          }
          confirmLabel="Eliminar orden"
          destructive
          title="Eliminar orden"
          description="Esta orden no tiene equipos asociados. ¿Querés eliminarla?"
          isPending={isDeleting}
        />
      )}
    </div>
  );
}
