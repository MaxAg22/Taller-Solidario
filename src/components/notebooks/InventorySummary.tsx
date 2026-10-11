import type { Notebook } from "@/interfaces";
import { NOTEBOOK_STATUSES } from "@/utils/notebookStatus";

export function InventorySummary({ notebooks, isLoading, hasError }: {
  notebooks: Notebook[];
  isLoading: boolean;
  hasError: boolean;
}) {
  const total = notebooks.length;
  const states = NOTEBOOK_STATUSES.map((state) => ({
    ...state,
    count: notebooks.filter((notebook) => notebook.status === state.value).length,
  }));
  const unavailable = isLoading || hasError;

  return (
    <section className="inventory-summary" aria-label="Resumen del inventario" aria-busy={isLoading}>
      <div className="inventory-total">
        <div>
          <h2 className="inventory-summary-label">Total de equipos</h2>
          <p className="inventory-total-number">{unavailable ? "—" : total}</p>
        </div>
      </div>
      <div className="inventory-states">
        <h2 className="inventory-summary-label">Estado del inventario</h2>
        <div className="inventory-status-bar" role="img" aria-label={
          unavailable ? "Distribución no disponible" : total === 0 ? "Sin equipos con estados actuales" :
          states.map((state) => `${state.label}: ${state.count} de ${total} equipos con estados actuales`).join(", ")
        }>
          {!unavailable && states.map((state) => (
            <span key={state.value} style={{ width: `${total ? state.count / total * 100 : 0}%`, backgroundColor: state.color }} />
          ))}
        </div>
        <ul className="inventory-status-legend">
          {states.map((state) => (
            <li key={state.value}>
              <span className="inventory-status-dot" style={{ backgroundColor: state.color }} aria-hidden="true" />
              <div>
                <span className="inventory-status-name">{state.label}</span>
                <span className="inventory-status-count">{unavailable ? "—" : `${state.count} ${state.count === 1 ? "equipo" : "equipos"} · ${total ? Math.round(state.count / total * 100) : 0}%`}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
