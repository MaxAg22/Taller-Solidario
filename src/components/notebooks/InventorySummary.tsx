import { NOTEBOOK_STATUSES } from "@/utils/notebookStatus";
import { useInventorySummary } from "@/hooks";


export function InventorySummary() {

  const { perStatus, rowCount, isLoading, isError } = useInventorySummary();
  
  const states = NOTEBOOK_STATUSES.map((state) => ({
    ...state,
    count: perStatus?.find((item) => item.status === state.value)?.count ?? 0,
  }));
  const unavailable = isLoading || isError;

  return (
    <section className="inventory-summary" aria-label="Resumen del inventario" aria-busy={isLoading}>
      <div className="inventory-total">
        <div>
          <h2 className="inventory-summary-label">Total de equipos</h2>
          <p className="inventory-total-number">{unavailable ? "—" : rowCount}</p>
        </div>
      </div>
      <div className="inventory-states">
        <h2 className="inventory-summary-label">Estado del inventario</h2>
        <div className="inventory-status-bar" role="img" aria-label={
          unavailable ? "Distribución no disponible" : rowCount === 0 ? "Sin equipos con estados actuales" :
          states.map((state) => `${state.label}: ${state.count} de ${rowCount} equipos con estados actuales`).join(", ")
        }>
          {!unavailable && states.map((state) => (
            <span key={state.value} style={{ width: `${rowCount ? state.count / rowCount * 100 : 0}%`, backgroundColor: state.color }} />
          ))}
        </div>
        <ul className="inventory-status-legend">
          {states.map((state) => (
            <li key={state.value}>
              <span className="inventory-status-dot" style={{ backgroundColor: state.color }} aria-hidden="true" />
              <div>
                <span className="inventory-status-name">{state.label}</span>
                <span className="inventory-status-count">{unavailable ? "—" : `${state.count} ${state.count === 1 ? "equipo" : "equipos"} · ${rowCount ? Math.round(state.count / rowCount * 100) : 0}%`}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
