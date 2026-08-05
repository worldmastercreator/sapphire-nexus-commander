import { createFileRoute } from "@tanstack/react-router";
import DeveloperManagementDashboard from "@/pages/super-admin-system/RoleSwitch/DeveloperManagementDashboard";

export const Route = createFileRoute("/developer-team")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Developer Team Overview — Software Vala" },
      {
        name: "description",
        content:
          "Developer team overview: workload, skills, assignments and delivery health across the internal engineering team.",
      },
      { property: "og:title", content: "Developer Team Overview — Software Vala" },
      {
        property: "og:description",
        content:
          "Workload, skills, assignments and delivery health across the internal engineering team.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DeveloperManagementDashboard,
});
