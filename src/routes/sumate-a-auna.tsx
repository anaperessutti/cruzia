import { createFileRoute, redirect } from "@tanstack/react-router";

// Ruta anterior: redirección permanente a /sumate-a-cruzia.
export const Route = createFileRoute("/sumate-a-auna")({
  beforeLoad: () => {
    throw redirect({ to: "/sumate-a-cruzia", statusCode: 301 });
  },
});
