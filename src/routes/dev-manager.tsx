import { createFileRoute } from "@tanstack/react-router";
import SecureDevManagerDashboard from "@/pages/dev-manager/SecureDevManagerDashboard";

export const Route = createFileRoute("/dev-manager")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Developer Manager Console — Software Vala" },
      {
        name: "description",
        content:
          "Secure Developer Manager console: task delivery, capacity, SLA risk, escalations and audit trails for internal developers.",
      },
      { property: "og:title", content: "Developer Manager Console — Software Vala" },
      {
        property: "og:description",
        content:
          "Secure Developer Manager console: task delivery, capacity, SLA risk, escalations and audit trails.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SecureDevManagerDashboard,
});
