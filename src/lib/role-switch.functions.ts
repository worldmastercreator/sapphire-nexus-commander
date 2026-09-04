import { createHash, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";

const SESSION_NAME = "role-switch-access";

type RoleSwitchSession = {
  authenticated?: boolean;
  role?: "super_admin";
};

function getSessionConfig() {
  const password = process.env["ROLE_SWITCH_SESSION_SECRET"];
  if (!password) throw new Error("Role switch session is not configured");

  return {
    password,
    name: SESSION_NAME,
    maxAge: 60 * 60 * 8,
    cookie: {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

function matchesSecret(input: string, expected: string | undefined): boolean {
  if (!expected) return false;
  const inputDigest = createHash("sha256").update(input, "utf8").digest();
  const expectedDigest = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(inputDigest, expectedDigest);
}

export const authenticateSuperAdmin = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        username: z.string().trim().min(1).max(200),
        password: z.string().min(1).max(200),
        licenseKey: z.string().trim().min(1).max(100),
        backupKey: z.string().trim().min(1).max(100),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const valid =
      matchesSecret(data.username, process.env["SUPER_ADMIN_USERNAME"]) &&
      matchesSecret(data.password, process.env["SUPER_ADMIN_PASSWORD"]) &&
      matchesSecret(data.licenseKey, process.env["SUPER_ADMIN_LICENSE_KEY"]) &&
      matchesSecret(data.backupKey, process.env["SUPER_ADMIN_BACKUP_KEY"]);

    if (!valid) return { ok: false as const };

    const session = await useSession<RoleSwitchSession>(getSessionConfig());
    await session.update({ authenticated: true, role: "super_admin" });
    return { ok: true as const, role: "super_admin" as const };
  });

export const getRoleSwitchSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<RoleSwitchSession>(getSessionConfig());
  return session.data.authenticated && session.data.role === "super_admin"
    ? { authenticated: true as const, role: "super_admin" as const }
    : { authenticated: false as const };
});

export const clearRoleSwitchSession = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<RoleSwitchSession>(getSessionConfig());
  await session.clear();
  return { ok: true as const };
});