import { createFileRoute } from "@tanstack/react-router";
import DMFullLayout from "@/components/developer-management/DMFullLayout";

export const Route = createFileRoute("/developer-management")({
  head: () => ({
    meta: [
      { title: "Developer Management — 17 Module Console" },
      {
        name: "description",
        content:
          "Full Developer Management console: registry, onboarding, sprints, builds, code review, QA, KPI, payouts, compliance and audit logs.",
      },
      { property: "og:title", content: "Developer Management — 17 Module Console" },
      {
        property: "og:description",
        content:
          "Registry, onboarding, sprints, builds, code review, QA, KPI, payouts, compliance and audit logs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DMFullLayout,
});
