import { createHashRouter } from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";
import NotebookInventoryPage from "@/pages/NotebookInventoryPage";

export const router = createHashRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <NotebookInventoryPage />,
      },
    ],
  },
]);
