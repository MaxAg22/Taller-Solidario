import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          style: {
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            boxShadow: "none",
            padding: "8px 12px",
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            lineHeight: "20px",
            maxWidth: "min(360px, calc(100vw - 32px))",
          },
          success: {
            iconTheme: { primary: "#15803d", secondary: "#f0fdf4" },
          },
          error: {
            iconTheme: { primary: "var(--destructive)", secondary: "#fef2f2" },
          },
        }}
      />
      <RouterProvider router={router} />{" "}
    </QueryClientProvider>
  </StrictMode>
);
