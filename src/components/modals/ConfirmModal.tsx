export const ConfirmModal = ({
  confirmDeleteId,
  handleDeleteNotebook,
  setConfirmDeleteId,
}: any) => {
  if (!confirmDeleteId) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-bold mb-4">Eliminar equipo</h2>
        <p className="mb-6">
          Esta acción no se puede deshacer. ¿Deseás eliminar este equipo?
        </p>

        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 bg-gray-200 rounded"
            onClick={() => setConfirmDeleteId(null)}
          >
            Cancelar
          </button>

          <button
            className="px-3 py-1 bg-red-600 text-white rounded"
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
