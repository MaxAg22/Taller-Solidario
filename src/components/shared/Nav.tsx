import { NavLink } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const activeStyleCallback = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "text-blue-600 shadow-[inset_0_-2px_0_#2563eb]"
    : "text-slate-600 hover:text-blue-600";

const navClass = (isActive: boolean) =>
  `${activeStyleCallback({ isActive })} flex h-full items-center px-4 text-sm font-bold transition-colors`;

const NavLinks = () => {
  return (
    <>
      <NavLink to="/" end className={({ isActive }) => navClass(isActive)}>
        Inventario
      </NavLink>
    </>
  );
};

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav className="flex h-full items-center justify-end md:flex-1">
        <div className="hidden h-full items-center md:flex">
          <NavLinks />
        </div>

        <div className="flex h-full items-center justify-end md:hidden">
          <button
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            onClick={toggleNavbar}
            type="button"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {isOpen && (
        <div className="flex basis-full flex-col items-stretch border-t border-slate-100 py-2 md:hidden">
          <NavLinks></NavLinks>
        </div>
      )}
    </>
  );
};

export default Nav;
