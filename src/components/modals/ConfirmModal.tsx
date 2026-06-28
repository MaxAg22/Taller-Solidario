export const ConfirmModal = ({
  confirmDeleteId,
  handleDeleteNotebook,
  setConfirmDeleteId,
}: {
  confirmDeleteId: string | null;
  handleDeleteNotebook: (id: string) => void;
  setConfirmDeleteId: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  if (!confirmDeleteId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-80 rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold">Eliminar equipo</h2>
        <p className="mb-6">Esta acción no se puede deshacer, ¿Deseás eliminar este equipo?</p>

        <div className="flex justify-end gap-2">
          <button
            className="rounded bg-gray-200 px-3 py-1"
            onClick={() => setConfirmDeleteId(null)}
          >
            Cancelar
          </button>

          <button
            className="rounded bg-red-600 px-3 py-1 text-white"
            onClick={() => {
              handleDeleteNotebook(confirmDeleteId);
              setConfirmDeleteId(null);
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};
