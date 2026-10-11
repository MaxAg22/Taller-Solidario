import Logo from "./Logo";
import Nav from "./Nav";

export const Header = () => (
  <header className="inventory-header">
    <div className="inventory-brand">
      <Logo />
      <span>Taller Solidario</span>
    </div>
    <Nav />
  </header>
);

export default Header;
