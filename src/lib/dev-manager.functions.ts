/**
 * Developer Manager server functions (typed RPC).
 * Every function is authenticated and enforces the Developer Manager role,
 * and every mutation writes an audit_logs row.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { DeliveryOverviewDTO } from "./dev-manager.types";

export const getDeliveryOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DeliveryOverviewDTO> => {
    const { assertDevManager, loadDeliveryOverview } = await import("./dev-manager.server");
    await assertDevManager(context.supabase, context.userId);
    return loadDeliveryOverview(context.supabase, context.userId);
  });

export const reassignTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        taskId: z.string().uuid(),
        newDeveloperId: z.string().uuid(),
        reason: z.string().trim().min(5).max(1000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertDevManager, reassignTaskInDb } = await import("./dev-manager.server");
    await assertDevManager(context.supabase, context.userId);
    return reassignTaskInDb(
      context.supabase,
      context.userId,
      data.taskId,
      data.newDeveloperId,
      data.reason,
    );
  });

export const escalateTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        taskId: z.string().uuid(),
        reason: z.string().trim().min(5).max(1000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertDevManager, escalateTaskInDb } = await import("./dev-manager.server");
    await assertDevManager(context.supabase, context.userId);
    return escalateTaskInDb(context.supabase, context.userId, data.taskId, data.reason);
  });

export const updateEscalation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        escalationId: z.string().uuid(),
        status: z.enum(["acknowledged", "resolved", "rejected"]),
        resolution: z.string().trim().max(1000).nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertDevManager, updateEscalationInDb } = await import("./dev-manager.server");
    await assertDevManager(context.supabase, context.userId);
    return updateEscalationInDb(
      context.supabase,
      context.userId,
      data.escalationId,
      data.status,
      data.resolution,
    );
  });

export const addInternalNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        taskId: z.string().uuid(),
        content: z.string().trim().min(3).max(2000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertDevManager, addInternalNoteInDb } = await import("./dev-manager.server");
    await assertDevManager(context.supabase, context.userId);
    return addInternalNoteInDb(context.supabase, context.userId, data.taskId, data.content);
  });
