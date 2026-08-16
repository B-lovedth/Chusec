import type { Severity } from "@/data/dashboard";

/* ------------------------------------------------------------------ *
 * Command centre statistics
 * ------------------------------------------------------------------ */

export type StatKey = "active" | "liveSos" | "citizensAlerted" | "unitDeployed" | "resolvedToday";

export type CommandStat = {
  key: StatKey;
  label: string;
  value: string;
};

export type QueueTag = { kind: "severity"; value: Severity } | { kind: "sos" } | { kind: "resolved" };

export type CommandIncident = {
  id: string;
  reference: string;
  date: string;
  time: string;
  title: string;
  location: string;
  tag: QueueTag;
  /** Position on the command map, in the map's 0–100 coordinate space. */
  point: { x: number; y: number };
  severity: Severity;
  reportedBy: string;
  narrative: string;
  evidence: { name: string; kind: string }[];
};

/* ------------------------------------------------------------------ *
 * Nearest forces
 * ------------------------------------------------------------------ */

export type Agency =
  | "Nigeria Police Force"
  | "DSS"
  | "NSCDC"
  | "Immigration"
  | "Nigeria Custom"
  | "Correctional Service"
  | "NDLEA"
  | "FRSC";

/* ------------------------------------------------------------------ *
 * Members
 *
 * THE LAST FIXTURE IN THE APP. The API has no members resource — the only
 * related endpoints are /api/auth/pending-units, approve-unit and
 * reject-unit, which cover unit approval rather than staff management.
 * Replace `members` as soon as a members endpoint exists.
 * ------------------------------------------------------------------ */

export type MemberStatus = "Active" | "Pending";

export type Member = {
  id: string;
  name: string;
  role: "Administrator" | "Staff user";
  email: string;
  status: MemberStatus;
  /** Falls back to initials when absent. */
  avatar?: string;
};

export const members: Member[] = [
  { id: "m1", name: "Noah Useghan", role: "Staff user", email: "n.usghan@gmail.com", status: "Active" },
  {
    id: "m2",
    name: "Mark Jones",
    role: "Administrator",
    email: "willie.jennings@example.com",
    status: "Pending",
  },
  { id: "m3", name: "Luke Harper", role: "Staff user", email: "kenzi.lawson@example.com", status: "Active" },
  {
    id: "m4",
    name: "David Micheal",
    role: "Administrator",
    email: "bill.sanders@example.com",
    status: "Active",
  },
  { id: "m5", name: "Mary Mannah", role: "Staff user", email: "sara.cruz@example.com", status: "Active" },
  {
    id: "m6",
    name: "Hannah James",
    role: "Staff user",
    email: "deanna.curtis@example.com",
    status: "Pending",
  },
  { id: "m7", name: "Sarah Mila", role: "Staff user", email: "felicia.reid@example.com", status: "Active" },
  {
    id: "m8",
    name: "Favour Moana",
    role: "Staff user",
    email: "jackson.graham@example.com",
    status: "Active",
  },
  {
    id: "m9",
    name: "Joseph Useghan",
    role: "Staff user",
    email: "debbie.baker@example.com",
    status: "Active",
  },
];

export type SecurityUnit = {
  id: string;
  name: string;
  agency: Agency;
  state: string;
  address: string;
  lga: string;
  phone: string;
  respondingUnit: string;
  teamLead: string;
  responders: string[];
  vehicles: string[];
};

