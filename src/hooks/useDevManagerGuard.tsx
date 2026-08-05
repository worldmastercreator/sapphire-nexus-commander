/**
 * DEV MANAGER ROUTE GUARD — ported from the source project and adapted to
 * TanStack Router. Keeps the Developer Manager confined to its own surface:
 * finance, admin, pricing and master areas are never reachable from here.
 */
import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "./useAuth";

const BLOCKED_ROUTES = [
  "/admin",
  "/finance",
  "/wallet",
  "/pricing",
  "/master",
  "/demos",
  "/users",
  "/vala",
];

const ALLOWED_ROUTES = ["/", "/dev-manager", "/logout", "/settings", "/auth"];

export interface DevManagerStats {
  totalDevelopers: number;
  activeTasks: number;
  atRiskTasks: number;
  blockedTasks: number;
  overdueCount: number;
}

export function useDevManagerGuard() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading } = useAuth();

  const isBlocked = BLOCKED_ROUTES.some((route) => pathname.startsWith(route));

  // Authentication gate: no session -> back to the sign-in surface.
  useEffect(() => {
    if (loading) return;
    if (!user && pathname !== "/auth") {
      void navigate({ to: "/auth", replace: true });
    }
  }, [loading, user, pathname, navigate]);

  useEffect(() => {
    if (isBlocked) {
      void navigate({ to: "/", replace: true });
      return;
    }

    const isAllowed = ALLOWED_ROUTES.some((route) => pathname.startsWith(route));
    if (!isAllowed) {
      void navigate({ to: "/", replace: true });
    }
  }, [pathname, navigate, isBlocked]);


  return {
    isBlocked,
    currentPath: pathname,
    userId: user?.id,
  };
}

export default useDevManagerGuard;
