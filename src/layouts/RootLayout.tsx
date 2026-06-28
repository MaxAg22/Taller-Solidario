// Layout es lo que se renderiza en todas las rutas
// Outlet es donde se renderiza el contenido de cada ruta específica

import Header from "@/components/shared/Header";
import { Outlet } from "react-router-dom";

export const RootLayout = () => {
  return (
    <div className="h-screen flex flex-col font-montserrat">
      <Header />
      <main className="min-h-0 flex-1 overflow-hidden bg-slate-50">
        <Outlet />
      </main>

      {/* FOOTER */}
    </div>
  );
};
