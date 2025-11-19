// Layout es lo que se renderiza en todas las rutas
// Outlet es donde se renderiza el contenido de cada ruta específica

import Header from "@/components/shared/navbar/Header";
import { Outlet } from "react-router-dom";

export const RootLayout = () => {
  return (
    <div className="h-screen flex flex-col font-montserrat">
      <Header />
      <main className="container my-8 flex-1 mx-auto px-4">
        <Outlet />
      </main>

      {/* FOOTER */}
    </div>
  );
};
