import { NavLink } from "react-router-dom";

const Nav = () => (
  <nav className="inventory-nav" aria-label="Navegación principal">
    <NavLink to="/" end>Inventario</NavLink>
  </nav>
);

export default Nav;
