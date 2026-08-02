import { createFileRoute } from "@tanstack/react-router";
import DevManagerAuth from "@/pages/dev-manager/DevManagerAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in | Developer Manager Console" },
      {
        name: "description",
        content:
          "Secure sign-in for the Developer Manager console — access delivery governance, developer registry and audit logs.",
      },
      { property: "og:title", content: "Sign in | Developer Manager Console" },
      {
        property: "og:description",
        content: "Secure sign-in for the Software Vala Developer Manager console.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DevManagerAuth,
});
