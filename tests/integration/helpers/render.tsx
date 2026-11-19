import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement, ReactNode } from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

export function createQueryClientTest() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
  route?: string;
  children?: ReactNode;
}

/**
 * Renderiza `element` envuelto con QueryClientProvider + MemoryRouter.
 * `route` es el path inicial del router (ej: "/ordenes/abc").
 */
export function renderWithProviders(
  element: ReactElement,
  { queryClient, route = "/", children, ...options }: RenderWithProvidersOptions = {},
) {
  const client = queryClient ?? createQueryClientTest();
  const router = createMemoryRouter(
    [{ path: "*", element: <div>{element}{children}</div> }],
    { initialEntries: [route] },
  );

  return {
    ...render(
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
      options,
    ),
    queryClient: client,
  };
}
