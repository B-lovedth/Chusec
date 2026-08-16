/** The two product surfaces a signed-in user can land on. */
export type AppArea = "citizen" | "command";

function normalise(role: string) {
  return role.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

/**
 * Roles that belong to the command centre. Anything unrecognised is treated as
 * a citizen — this guard is UX only, and the API is what actually enforces
 * access, so failing closed here is the safe default.
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
  "agency",
  "unit",
  "responder",
]);

export function areaForRole(role: string | null | undefined): AppArea {
  return COMMAND_ROLES.has(normalise(role ?? "")) ? "command" : "citizen";
}

export const areaHome: Record<AppArea, string> = {
  citizen: "/dashboard",
  command: "/admin/dashboard",
};

export function areaForPath(pathname: string): AppArea {
  return pathname.startsWith("/admin") ? "command" : "citizen";
}
