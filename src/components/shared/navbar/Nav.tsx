import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const activeStyleCallback = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "navlink font-semibold text-blue-600"
    : "navlink text-gray-700 hover:text-blue-500 transition-colors";

const navClass = (isActive: boolean) =>
  `${activeStyleCallback({ isActive })} font-montserrat`;

const NavLinks = () => {
  return (
    <>
      <NavLink to="/" className={({ isActive }) => navClass(isActive)}>
        Inventario
      </NavLink>
      <NavLink
        to="/asistencia"
        className={({ isActive }) => navClass(isActive)}
      >
        Asistencia
      </NavLink>
      <NavLink to="/ordenes" className={({ isActive }) => navClass(isActive)}>
        Ordenes
      </NavLink>
    </>
  );
};

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    Promise.resolve().then(() => setIsOpen(false));
  }, [location.pathname]);

  return (
    <>
      <nav className="w-1/3 flex justify-end">
        <div className="hidden w-full justify-between md:flex">
          <NavLinks />
        </div>

        <div className="flex w-[75px] justify-end md:hidden">
          <button onClick={toggleNavbar}>{isOpen ? <X /> : <Menu />}</button>
        </div>
      </nav>
      {isOpen && (
        <div className="flex flex-col items-center basis-full">
          <NavLinks></NavLinks>
        </div>
      )}
    </>
  );
};

export default Nav;
