import Logo from "./Logo";
import Nav from "./Nav";

export const Header = () => {
  return (
    <header
      className="sticky top-0 z-1 mx-auto  flex w-full max-w-7xl flex-wrap 
    items-center justify-between border-b border-gray-100 bg-background px-4 py-3 
     font-bold text-text-primary backdrop-blur-[100px] dark:border-gray-800 
    dark:bg-d-background dark:text-d-text-primary font-montserrat"
    >
      <Logo />
      <h1 className="hidden sm:block text-lg tracking-wide font-montserrat">
        Taller Solidario de Notebooks
      </h1>
      <Nav />
    </header>
  );
};

export default Header;
