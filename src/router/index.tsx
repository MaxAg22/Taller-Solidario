import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";
import NotebookInventoryPage from "@/pages/NotebookInventoryPage";
import NotebookOrderPage from "@/pages/NotebookOrderPage";
/*
Aquí ponemos las rutas y los elementos que se
renderizan en las mismas. Todo anidado, no hace falta '/'.
*/
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <NotebookInventoryPage />,
      },
      {
        path: "/ordenes",
        element: <NotebookOrderPage />,
      },
    ],
  },
]);
