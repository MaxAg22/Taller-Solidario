import React, { useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Spinner } from "../components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardList,
  Gift,
  Lock,
  Monitor,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
  Wrench,
} from "lucide-react";
import { useNotebooks } from "@/hooks";
import type { Notebook, NotebookStatus } from "../interfaces/notebook.interface";
import { NotebookFormModal } from "../components/forms/NotebookForm/NotebookFormModal";
import { useDeleteNotebook } from "@/hooks/notebooks/useDeleteNotebook";
import { ConfirmModal } from "../components/modals/ConfirmModal";

const statusStyles: Record<NotebookStatus, string> = {
  Recibido: "bg-blue-50 text-blue-700 ring-blue-200",
  "En Reparación": "bg-blue-50 text-blue-700 ring-blue-200",
  "Instalar SO": "bg-indigo-50 text-indigo-700 ring-indigo-200",
  "Listo para Donar": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Donado: "bg-slate-100 text-slate-700 ring-slate-200",
  Bloqueada: "bg-red-50 text-red-700 ring-red-200",
  Desbloqueada: "bg-orange-50 text-orange-700 ring-orange-200",
};

const statusOptions: NotebookStatus[] = [
  "Recibido",
  "En Reparación",
  "Instalar SO",
  "Listo para Donar",
  "Donado",
  "Bloqueada",
  "Desbloqueada",
];

const formatNumber = (value: number) => new Intl.NumberFormat("es-AR").format(value);

const formatDate = (value: string) => {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR").format(date);
};

const getShortText = (value: string, fallback = "—") => value?.trim() || fallback;

export default function NotebookInventoryPage() {
  const [modalNotebook, setModalNotebook] = useState<Notebook | null>(null);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { notebooks: ntbks, isLoading } = useNotebooks();
  const { mutate: deleteNotebook } = useDeleteNotebook();

  const notebooks = ntbks ?? [];

  const metrics = useMemo(() => {
    const total = notebooks.length;
    const blocked = notebooks.filter((notebook) => notebook.status === "Bloqueada").length;
    const ready = notebooks.filter((notebook) => notebook.status === "Listo para Donar").length;
    const repairing = notebooks.filter((notebook) => notebook.status === "En Reparación").length;
    const diagnosis = notebooks.filter(
      (notebook) => notebook.status === "Recibido" || notebook.status === "Instalar SO"
    ).length;

    return { blocked, diagnosis, ready, repairing, total };
  }, [notebooks]);

  const filteredNotebooks = useMemo(() => {
    return notebooks
      .filter((notebook) => {
        if (statusFilter === "all") return true;
        return notebook.status === statusFilter;
      })
      .filter((notebook) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        return (
          notebook.serialNumber.toLowerCase().includes(term) ||
          notebook.brand.toLowerCase().includes(term) ||
          notebook.model.toLowerCase().includes(term) ||
          notebook.status.toLowerCase().includes(term)
        );
      });
  }, [notebooks, searchTerm, statusFilter]);

  const activeNotebook = useMemo(() => {
    return (
      filteredNotebooks.find((notebook) => notebook.id === activeNotebookId) ??
      filteredNotebooks[0] ??
      null
    );
  }, [activeNotebookId, filteredNotebooks]);

  const handleOpenModal = (notebook: Notebook | null) => {
    setModalNotebook(notebook);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalNotebook(null);
  };

  const handleSaveNotebook = () => {
    handleCloseModal();
  };

  const handleDeleteNotebook = (id: string) => {
    setDeletingId(id);

    deleteNotebook(id, {
      onSettled: () => {
        setDeletingId(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="w-10 h-10 size-15" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden bg-slate-50 text-slate-950">
      {isModalOpen && (
        <NotebookFormModal
          notebook={modalNotebook}
          onSave={handleSaveNotebook}
          onClose={handleCloseModal}
        />
      )}

      {confirmDeleteId && (
        <ConfirmModal
          confirmDeleteId={confirmDeleteId}
          handleDeleteNotebook={handleDeleteNotebook}
          setConfirmDeleteId={setConfirmDeleteId}
        />
      )}

      <div className="mx-auto flex h-full max-w-[1500px] flex-col gap-2 px-3 py-2 sm:px-4 lg:px-6">
        <section className="grid shrink-0 gap-2 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            color="from-indigo-500 to-violet-600"
            icon={<Monitor className="h-7 w-7" />}
            label="Total de equipos"
            value={metrics.total}
            detail="Todos los estados"
          />
          <MetricCard
            color="from-amber-400 to-orange-500"
            icon={<ClipboardList className="h-7 w-7" />}
            label="Pendientes diagnóstico"
            value={metrics.diagnosis}
            detail="Equipos por revisar"
          />
          <MetricCard
            color="from-emerald-400 to-green-600"
            icon={<Gift className="h-7 w-7" />}
            label="Listos para donar"
            value={metrics.ready}
            detail="Disponibles para órdenes"
          />
          <MetricCard
            color="from-rose-400 to-red-600"
            icon={<Lock className="h-7 w-7" />}
            label="Bloqueados"
            value={metrics.blocked}
            detail="Requieren desbloqueo"
          />
          <MetricCard
            color="from-sky-500 to-blue-700"
            icon={<Wrench className="h-7 w-7" />}
            label="En reparación"
            value={metrics.repairing}
            detail="Trabajo en curso"
          />
        </section>

        <section className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="flex min-h-0 flex-col gap-2">
            <Card className="shrink-0 border-slate-200 bg-white py-0 shadow-sm">
              <CardContent className="grid gap-2 p-2 md:grid-cols-[minmax(260px,1fr)_220px_auto] lg:grid-cols-[minmax(320px,1fr)_220px_auto] lg:items-center">
                <InventoryToolbar
                  handleOpenModal={handleOpenModal}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  setStatusFilter={setStatusFilter}
                  statusFilter={statusFilter}
                />
              </CardContent>
            </Card>

            <Card className="flex min-h-0 gap-0 overflow-hidden border-slate-200 bg-white py-0 shadow-sm">
              <div className="min-h-0 flex-1 overflow-y-auto">
                <table className="w-full table-fixed text-left text-sm">
                  <thead className="sticky top-0 z-10 border-b border-slate-200 bg-white text-xs font-semibold text-slate-500">
                    <tr>
                      <th className="w-[92px] px-4 py-2.5">Serie</th>
                      <th className="px-3 py-2.5">Modelo</th>
                      <th className="hidden w-[150px] px-3 py-2.5 md:table-cell">Marca</th>
                      <th className="hidden w-[150px] px-3 py-2.5 sm:table-cell">Estado</th>
                      <th className="w-[90px] px-4 py-2.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredNotebooks.map((notebook) => {
                      const isActive = activeNotebook?.id === notebook.id;

                      return (
                        <tr
                          key={notebook.id}
                          className={`cursor-pointer transition hover:bg-slate-50 ${
                            isActive ? "bg-blue-50/80 shadow-[inset_3px_0_0_#2563eb]" : "bg-white"
                          }`}
                          onClick={() => setActiveNotebookId(notebook.id)}
                        >
                          <td className="whitespace-nowrap px-4 py-2 font-mono font-bold text-slate-900">
                            #{notebook.serialNumber || "S/N"}
                          </td>
                          <td className="min-w-0 px-3 py-2 font-semibold text-slate-800">
                            <p className="truncate">{notebook.model || "Sin modelo"}</p>
                            <p className="truncate text-xs font-normal text-slate-500 md:hidden">
                              {notebook.brand || "Sin marca"}
                            </p>
                            <div className="mt-1 sm:hidden">
                              <StatusBadge status={notebook.status} />
                            </div>
                          </td>
                          <td className="hidden px-3 py-2 text-slate-600 md:table-cell">
                            <p className="truncate">{notebook.brand || "Sin marca"}</p>
                          </td>
                          <td className="hidden px-3 py-2 sm:table-cell">
                            <StatusBadge status={notebook.status} />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleOpenModal(notebook);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                size="icon-sm"
                                variant="ghost"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setConfirmDeleteId(notebook.id);
                                }}
                              >
                                {deletingId === notebook.id ? <Spinner /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredNotebooks.length === 0 ? (
                <div className="border-t border-slate-100 px-6 py-16 text-center">
                  <h2 className="text-xl font-semibold text-slate-700">No se encontraron equipos</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Intenta ajustar tu búsqueda o filtro, o agrega un nuevo equipo.
                  </p>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => handleOpenModal(null)}>
                    <PlusCircle className="h-4 w-4" /> Agregar Primer Equipo
                  </Button>
                </div>
              ) : null}

              <div className="shrink-0 flex flex-col gap-2 border-t border-slate-200 px-5 py-2 text-sm text-slate-600 lg:flex-row lg:items-center lg:justify-between">
                <p>
                  Mostrando {formatNumber(filteredNotebooks.length)} de {formatNumber(notebooks.length)} equipos
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button disabled size="sm" variant="outline">
                    Anterior
                  </Button>
                  {[1, 2, 3, 4, 5].map((page) => (
                    <Button
                      key={page}
                      className={page === 1 ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                      size="sm"
                      variant={page === 1 ? "default" : "outline"}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button size="sm" variant="outline">
                    Siguiente
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <EquipmentDetailPanel notebook={activeNotebook} />
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  color,
  detail,
  icon,
  label,
  value,
}: {
  color: string;
  detail: string;
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card className="border-slate-200 bg-white py-0 shadow-sm">
      <CardContent className="flex items-center gap-2 p-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${color} text-white shadow-md [&>svg]:h-4 [&>svg]:w-4`}>
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-medium leading-tight text-slate-500">{label}</p>
          <p className="text-lg font-black leading-tight tracking-tight text-slate-900">{formatNumber(value)}</p>
          <p className="text-[11px] text-slate-500">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: NotebookStatus }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

function DetailValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 line-clamp-3 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function EquipmentDetailPanel({ notebook }: { notebook: Notebook | null }) {
  if (!notebook) {
    return (
      <Card className="flex min-h-0 gap-0 overflow-hidden border-slate-200 bg-white py-0 shadow-sm">
        <CardContent className="flex min-h-0 flex-1 flex-col gap-2 p-2">
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm font-medium text-slate-500">
            No hay equipos para mostrar.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex min-h-0 gap-0 overflow-hidden border-slate-200 bg-white py-0 shadow-sm">
      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-2.5">
          <h2 className="text-base font-black text-slate-900">Detalle del equipo</h2>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 p-2.5">
            <DetailValue label="Ingreso" value={formatDate(notebook.entryDate)} />
          </div>

          <div className="space-y-2 rounded-xl border border-slate-200 p-2.5">
            <DetailValue label="Specs" value={getShortText(notebook.specs)} />
            <DetailValue label="Tareas a realizar" value={getShortText(notebook.repairNeeded)} />
            <DetailValue label="Historial de reparaciones" value={getShortText(notebook.repairHistory)} />
          </div>

        </div>
      </CardContent>
    </Card>
  );
}

function InventoryToolbar({
  handleOpenModal,
  searchTerm,
  setSearchTerm,
  setStatusFilter,
  statusFilter,
}: {
  handleOpenModal: (notebook: Notebook | null) => void;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  statusFilter: string;
}) {
  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Buscar por serie, marca o modelo..."
          className="h-9 rounded-xl border-slate-200 bg-white pl-10"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        />
      </div>
      <Select onValueChange={setStatusFilter} value={statusFilter}>
        <SelectTrigger className="h-9 rounded-xl border-slate-200 bg-white">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          {statusOptions.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button className="h-9 w-full rounded-xl bg-blue-600 px-5 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 lg:w-auto" onClick={() => handleOpenModal(null)}>
        <PlusCircle className="h-4 w-4" />
        Agregar equipo
      </Button>
    </>
  );
}
