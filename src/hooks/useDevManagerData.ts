/**
 * Client data layer for the Developer Manager delivery-governor surfaces:
 * TanStack Query reads through authenticated server functions, live realtime
 * notifications, and audited mutations.
 */
import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

import {
  addInternalNote,
  escalateTask,
  getAuditTrail,
  getDeliveryOverview,
  reassignTask,
  updateEscalation,
} from "@/lib/dev-manager.functions";
import type { AuditTrailDTO, DeliveryOverviewDTO, EscalationStatus } from "@/lib/dev-manager.types";

export const DELIVERY_QUERY_KEY = ["dev-manager", "delivery-overview"] as const;

export function useDeliveryOverview() {
  const fetchOverview = useServerFn(getDeliveryOverview);
  const queryClient = useQueryClient();
  const seenEscalations = useRef<Set<string>>(new Set());
  const { session, loading: authLoading } = useAuth();

  const query = useQuery<DeliveryOverviewDTO>({
    queryKey: DELIVERY_QUERY_KEY,
    queryFn: () => fetchOverview(),
    enabled: !authLoading && !!session,
    retry: (count, error) =>
      !/Unauthorized|Forbidden/.test(error instanceof Error ? error.message : "") && count < 2,
    refetchInterval: 60_000,
    staleTime: 15_000,
  });


  // Realtime notifications: task + escalation + note changes push a refresh.
  useEffect(() => {
    const channel = supabase
      .channel("dev-manager-delivery")
      .on("postgres_changes", { event: "*", schema: "public", table: "developer_tasks" }, () => {
        void queryClient.invalidateQueries({ queryKey: DELIVERY_QUERY_KEY });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "task_internal_notes" }, () => {
        void queryClient.invalidateQueries({ queryKey: DELIVERY_QUERY_KEY });
      })
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "escalations" },
        (payload) => {
          const row = payload.new as { id?: string; reason?: string };
          if (row.id && !seenEscalations.current.has(row.id)) {
            seenEscalations.current.add(row.id);
            toast({
              title: "New escalation",
              description: row.reason ?? "An escalation was raised",
              variant: "destructive",
            });
          }
          void queryClient.invalidateQueries({ queryKey: DELIVERY_QUERY_KEY });
        },
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "escalations" }, () => {
        void queryClient.invalidateQueries({ queryKey: DELIVERY_QUERY_KEY });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

function describeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("Forbidden")) return "You do not have permission for this action.";
  if (message.includes("Unauthorized")) return "Your session expired. Please sign in again.";
  return message;
}

function useAuditedMutation<TInput, TResult>(
  fn: (input: { data: TInput }) => Promise<TResult>,
  successTitle: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TInput) => fn({ data: input }),
    onSuccess: () => {
      toast({ title: successTitle, variant: "success" });
      void queryClient.invalidateQueries({ queryKey: DELIVERY_QUERY_KEY });
    },
    onError: (error) => {
      toast({ title: "Action failed", description: describeError(error), variant: "destructive" });
    },
  });
}

export function useReassignTask() {
  const fn = useServerFn(reassignTask);
  return useAuditedMutation<{ taskId: string; newDeveloperId: string; reason: string }, unknown>(
    fn as never,
    "Task reassigned",
  );
}

export function useEscalateTask() {
  const fn = useServerFn(escalateTask);
  return useAuditedMutation<{ taskId: string; reason: string }, unknown>(
    fn as never,
    "Escalation recorded",
  );
}

export function useUpdateEscalation() {
  const fn = useServerFn(updateEscalation);
  return useAuditedMutation<
    { escalationId: string; status: EscalationStatus; resolution: string | null },
    unknown
  >(fn as never, "Escalation updated");
}

export function useAddInternalNote() {
  const fn = useServerFn(addInternalNote);
  return useAuditedMutation<{ taskId: string; content: string }, unknown>(
    fn as never,
    "Internal note added",
  );
}

export const AUDIT_QUERY_KEY = ["dev-manager", "audit-trail"] as const;

export function useAuditTrail(params: {
  page: number;
  pageSize: number;
  search: string;
  module: string;
}) {
  const fetchAudit = useServerFn(getAuditTrail);
  const { session, loading: authLoading } = useAuth();

  return useQuery<AuditTrailDTO>({
    queryKey: [...AUDIT_QUERY_KEY, params],
    queryFn: () => fetchAudit({ data: params }),
    enabled: !authLoading && !!session,
    retry: (count, error) =>
      !/Unauthorized|Forbidden/.test(error instanceof Error ? error.message : "") && count < 2,
    staleTime: 10_000,
    placeholderData: (prev) => prev,
  });
}
