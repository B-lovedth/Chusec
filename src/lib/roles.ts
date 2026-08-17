/** The three product surfaces a signed-in user can land on. */
export type AppArea = "citizen" | "command" | "unit";

function normalise(role: string) {
  return role.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

/**
 * Responding units — law enforcement dispatched to incidents. Checked before
 * the command roles so "unit" style roles do not fall through to it.
 */
const UNIT_ROLES = new Set(["unit", "responder", "field", "fieldunit", "agency", "police", "officer"]);

/**
 * Command centre operators. Anything unrecognised is treated as a citizen —
 * this guard is UX only, and the API is what actually enforces access, so
 * failing closed here is the safe default.
 */
const COMMAND_ROLES = new Set([
  "admin",
  "administrator",
  "superadmin",
  "super",
  "commandcentre",
  "commandcenter",
  "command",
  "operator",
  "dispatcher",
  "staff",
  "staffuser",
]);

export function areaForRole(role: string | null | undefined): AppArea {
  const value = normalise(role ?? "");
  if (UNIT_ROLES.has(value)) return "unit";
  if (COMMAND_ROLES.has(value)) return "command";
  return "citizen";
}

export const areaHome: Record<AppArea, string> = {
  citizen: "/dashboard",
  command: "/admin/dashboard",
  unit: "/unit/dashboard",
};

export function areaForPath(pathname: string): AppArea {
  if (pathname.startsWith("/admin")) return "command";
  if (pathname.startsWith("/unit")) return "unit";
  return "citizen";
}
