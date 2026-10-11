import { NavLink } from "react-router-dom";

const Nav = () => (
  <nav className="inventory-nav" aria-label="Navegación principal">
    <NavLink to="/" end>Inventario</NavLink>
    <NavLink to="/asistencias">Asistencias</NavLink>
    <NavLink to="/tutoriales">Tutoriales</NavLink>
  </nav>
);

export default Nav;
