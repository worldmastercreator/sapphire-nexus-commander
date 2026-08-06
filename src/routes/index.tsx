import { createFileRoute } from "@tanstack/react-router";
import { RoutePending, RouteError } from "@/components/route-states";
import SecureDevManagerDashboard from "@/pages/dev-manager/SecureDevManagerDashboard";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Developer Manager Command Center | Software Vala" },
      {
        name: "description",
        content:
          "End-to-end Developer Manager console: capacity, SLA risk, blocked tasks, escalations and the full 17-screen developer management suite.",
      },
      { property: "og:title", content: "Developer Manager Command Center" },
      {
        property: "og:description",
        content:
          "Delivery governance, developer registry, sprints, QA, KPIs and audit logs in one secure console.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SecureDevManagerDashboard,
  pendingComponent: RoutePending,
  errorComponent: RouteError,
});
