/**
 * Developer Manager server functions (typed RPC).
 *
 * This module is a CHILD MODULE of a host platform: it does not own login.
 * The host app is the trust boundary, so these functions run without their own
 * auth gate. Every mutation still writes an audit_logs row, and the caller can
 * pass an `actor` label (host user id / name) that is recorded in the audit
 * trail — see the host connect panel in the UI.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { DeliveryOverviewDTO, RegistryDeveloperDTO } from "./dev-manager.types";

const actorSchema = z.string().trim().max(120).optional();

export const getDeliveryOverview = createServerFn({ method: "GET" }).handler(
  async (): Promise<DeliveryOverviewDTO> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { loadDeliveryOverview } = await import("./dev-manager.server");
    return loadDeliveryOverview(supabaseAdmin, null);
  },
);

export const reassignTask = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        taskId: z.string().uuid(),
        newDeveloperId: z.string().uuid(),
        reason: z.string().trim().min(5).max(1000),
        actor: actorSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { reassignTaskInDb } = await import("./dev-manager.server");
    return reassignTaskInDb(
      supabaseAdmin,
      null,
      data.taskId,
      data.newDeveloperId,
      data.reason,
      data.actor,
    );
  });

export const escalateTask = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        taskId: z.string().uuid(),
        reason: z.string().trim().min(5).max(1000),
        actor: actorSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { escalateTaskInDb } = await import("./dev-manager.server");
    return escalateTaskInDb(supabaseAdmin, null, data.taskId, data.reason, data.actor);
  });

export const updateEscalation = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        escalationId: z.string().uuid(),
        status: z.enum(["acknowledged", "resolved", "rejected"]),
        resolution: z.string().trim().max(1000).nullable().default(null),
        actor: actorSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { updateEscalationInDb } = await import("./dev-manager.server");
    return updateEscalationInDb(
      supabaseAdmin,
      null,
      data.escalationId,
      data.status,
      data.resolution,
      data.actor,
    );
  });

export const addInternalNote = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        taskId: z.string().uuid(),
        content: z.string().trim().min(3).max(2000),
        actor: actorSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { addInternalNoteInDb } = await import("./dev-manager.server");
    return addInternalNoteInDb(supabaseAdmin, null, data.taskId, data.content, data.actor);
  });

export const getAuditTrail = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(10).max(200).default(50),
        search: z.string().max(200).default(""),
        module: z.string().max(80).default("all"),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { loadAuditTrail } = await import("./dev-manager.server");
    return loadAuditTrail(supabaseAdmin, data.page, data.pageSize, data.search, data.module);
  });

export const getDeveloperRegistry = createServerFn({ method: "GET" }).handler(
  async (): Promise<RegistryDeveloperDTO[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { loadDeveloperRegistry } = await import("./dev-manager.server");
    return loadDeveloperRegistry(supabaseAdmin);
  },
);

export const setDeveloperStatus = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        developerId: z.string().uuid(),
        status: z.enum(["active", "suspended", "probation", "exited"]),
        reason: z.string().trim().min(5).max(500),
        actor: actorSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { setDeveloperStatusInDb } = await import("./dev-manager.server");
    return setDeveloperStatusInDb(
      supabaseAdmin,
      data.developerId,
      data.status,
      data.reason,
      data.actor,
    );
  });
