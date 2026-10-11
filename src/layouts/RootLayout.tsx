import Header from "@/components/shared/Header";
import { Outlet } from "react-router-dom";

export const RootLayout = () => (
  <div className="inventory-app">
    <Header />
    <main className="inventory-content">
      <Outlet />
    </main>
  </div>
);
