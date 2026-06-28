import Logo from "./Logo";
import Nav from "./Nav";

export const Header = () => {
  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 font-montserrat text-slate-950 shadow-sm backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-950">
              FAMAF - Taller Solidario
            </h1>
            <p className="text-xs font-medium text-slate-500">Reparar · Enseñar · Donar</p>
          </div>
        </div>
        <Nav />
      </div>
    </header>
  );
};

export default Header;
