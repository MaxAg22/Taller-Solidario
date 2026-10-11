import { createHashRouter } from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";
import NotebookInventoryPage from "@/pages/NotebookInventoryPage";
import AttendancePage from "@/pages/AttendancePage";
import TutorialsPage from "@/pages/TutorialsPage";
/*
Aquí ponemos las rutas y los elementos que se
renderizan en las mismas. Todo anidado, no hace falta '/'.
*/
export const router = createHashRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <NotebookInventoryPage />,
      },
      {
        path: "asistencias",
        element: <AttendancePage />,
      },
      {
        path: "tutoriales",
        element: <TutorialsPage />,
      },
    ],
  },
]);
