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

export const commandStats: CommandStat[] = [
  { key: "active", label: "Active", value: "5" },
  { key: "liveSos", label: "Live SOS", value: "10" },
  { key: "citizensAlerted", label: "Citizens Alerted", value: "4,821" },
  { key: "unitDeployed", label: "Unit Deployed", value: "14" },
  { key: "resolvedToday", label: "Resolved Today", value: "23" },
];

/* ------------------------------------------------------------------ *
 * Incident queue
 * ------------------------------------------------------------------ */

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

export const commandIncidents: CommandIncident[] = [
  {
    id: "inc-001",
    reference: "INC-001",
    date: "Aug 8, 2026",
    time: "14:32",
    title: "Armed Robbery",
    location: "1.2 km NE · 14:32",
    tag: { kind: "severity", value: "Critical" },
    point: { x: 52, y: 44 },
    severity: "Critical",
    reportedBy: "Noah Useghan",
    narrative: "Armed men blocking vehicles near Ekpan junction. 3 vehicles hijacked.",
    evidence: [{ name: "Video.mp4", kind: "video" }],
  },
  {
    id: "inc-002",
    reference: "INC-002",
    date: "Aug 8, 2026",
    time: "14:32",
    title: "Jack Doe",
    location: "Asaba-Agbor Expressway",
    tag: { kind: "sos" },
    point: { x: 74, y: 40 },
    severity: "Critical",
    reportedBy: "Jack Doe",
    narrative: "Live SOS beacon active on the Asaba-Agbor Expressway.",
    evidence: [],
  },
  {
    id: "inc-003",
    reference: "INC-003",
    date: "Aug 8, 2026",
    time: "14:32",
    title: "Kidnapping",
    location: "Benin-Auchi Road, Km 42",
    tag: { kind: "severity", value: "High" },
    point: { x: 33, y: 30 },
    severity: "High",
    reportedBy: "Anonymous",
    narrative: "Vehicle forced off the road at Km 42. Two occupants taken.",
    evidence: [{ name: "Photo.jpg", kind: "image" }],
  },
  {
    id: "inc-004",
    reference: "INC-004",
    date: "Aug 8, 2026",
    time: "14:32",
    title: "Mercy Ike",
    location: "Ughelli Market",
    tag: { kind: "sos" },
    point: { x: 40, y: 66 },
    severity: "Critical",
    reportedBy: "Mercy Ike",
    narrative: "SOS triggered inside Ughelli Market. Location sharing active.",
    evidence: [],
  },
  {
    id: "inc-005",
    reference: "INC-004",
    date: "Aug 8, 2026",
    time: "14:32",
    title: "Kemilade Joseph",
    location: "Ughelli Market",
    tag: { kind: "sos" },
    point: { x: 44, y: 70 },
    severity: "Critical",
    reportedBy: "Kemilade Joseph",
    narrative: "SOS triggered inside Ughelli Market. Location sharing active.",
    evidence: [],
  },
  {
    id: "inc-006",
    reference: "INC-004",
    date: "Aug 8, 2026",
    time: "14:32",
    title: "Suspicious Activity",
    location: "Ughelli Market",
    tag: { kind: "severity", value: "Medium" },
    point: { x: 47, y: 62 },
    severity: "Medium",
    reportedBy: "Anonymous",
    narrative: "Unmarked vehicle circling the market perimeter for over an hour.",
    evidence: [],
  },
  {
    id: "inc-007",
    reference: "INC-004",
    date: "Aug 8, 2026",
    time: "14:32",
    title: "Suspicious Activity",
    location: "Ughelli Market",
    tag: { kind: "severity", value: "Medium" },
    point: { x: 50, y: 58 },
    severity: "Medium",
    reportedBy: "Anonymous",
    narrative: "Group loitering near the market bank branch after closing.",
    evidence: [],
  },
  {
    id: "inc-008",
    reference: "INC-003",
    date: "Aug 8, 2026",
    time: "14:32",
    title: "Kidnapping",
    location: "Benin-Auchi Road, Km 42",
    tag: { kind: "severity", value: "High" },
    point: { x: 30, y: 26 },
    severity: "High",
    reportedBy: "Anonymous",
    narrative: "Second report of an abduction at the same stretch of road.",
    evidence: [],
  },
  {
    id: "inc-009",
    reference: "INC-005",
    date: "Aug 8, 2026",
    time: "14:32",
    title: "Cult Activity",
    location: "Effurun GRA, Warri",
    tag: { kind: "severity", value: "Low" },
    point: { x: 38, y: 74 },
    severity: "Low",
    reportedBy: "Anonymous",
    narrative: "Gathering reported near Effurun GRA. No violence observed yet.",
    evidence: [],
  },
];

/** Callout pinned to the map in the design. */
export const mapCallout = {
  reference: "INC-007",
  time: "07:30",
  title: "Armed Robbery",
  location: "Benin City Ring Road",
  note: "Night robbery crew active at Ring Road junction.",
  severity: "Critical" as Severity,
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

export type NearestForce = {
  id: string;
  agency: Agency;
  station: string;
  address: string;
  distance: string;
  contact: string;
};

export const nearestForces: NearestForce[] = [
  {
    id: "force-1",
    agency: "Nigeria Police Force",
    station: "Warri South-West divisional police",
    address: "Ogidigben Rd, Koko",
    distance: "2.1 km",
    contact: "DSP Solomon akpoviri",
  },
  {
    id: "force-2",
    agency: "DSS",
    station: "DSS Delta State Command",
    address: "Ogidigben Rd, Koko",
    distance: "3.3 km",
    contact: "ASP Ifeanyi Chukwu",
  },
  {
    id: "force-3",
    agency: "Nigeria Police Force",
    station: "Warri Area Command",
    address: "Warri/Sapele Rd, Warri",
    distance: "2.4 km",
    contact: "AC Festus Osaghae",
  },
];

/* ------------------------------------------------------------------ *
 * Charts
 * ------------------------------------------------------------------ */

/** Incidents per hour, indexed 00:00 – 23:00. */
export const incidentsPerHour = [
  2, 2, 1.6, 1.4, 1.2, 2, 3.2, 4.6, 6, 7.4, 8.6, 9.6, 10, 9.6, 9, 8.6, 9.4, 10.4, 9, 7.6, 6.4, 5.4, 4.6, 4.2,
];

export type WeeklyResolution = {
  day: string;
  incidents: number;
  resolved: number;
};

export const weeklyResolution: WeeklyResolution[] = [
  { day: "Mon", incidents: 15, resolved: 9 },
  { day: "Tue", incidents: 22, resolved: 15 },
  { day: "Wed", incidents: 10, resolved: 10 },
  { day: "Thu", incidents: 18, resolved: 14 },
  { day: "Fri", incidents: 11, resolved: 12 },
  { day: "Sat", incidents: 17, resolved: 18 },
  { day: "Sun", incidents: 12, resolved: 15 },
];

/* ------------------------------------------------------------------ *
 * Members and units
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

export const securityUnits: SecurityUnit[] = [
  {
    id: "u1",
    name: "Warri South-West Divisional Police",
    agency: "Nigeria Police Force",
    state: "Delta State",
    address: "Ogidigben Rd, Koko",
    lga: "Warri South-West LGA",
    phone: "08051234098",
    respondingUnit: "Marine Police Squad",
    teamLead: "DSP Solomon Akpoviri",
    responders: ["Sgt. Victor Egberi", "Cpl. Nancy Toritseju", "Pvt. Emmanuel Ajaero"],
    vehicles: ["DT-KOK-020", "DT-KOK-021 (Boat)"],
  },
  {
    id: "u2",
    name: "Warri Area Command",
    agency: "Nigeria Police Force",
    state: "Delta State",
    address: "Warri/Sapele Rd, Warri",
    lga: "Warri South LGA",
    phone: "08051234098",
    respondingUnit: "Marine Police Squad",
    teamLead: "ASP Ifeanyi Chukwu",
    responders: ["Sgt. Grace Oboh", "Cpl. Peter Ede"],
    vehicles: ["DT-WAR-114"],
  },
  {
    id: "u3",
    name: "NSCDC Warri Area Command",
    agency: "NSCDC",
    state: "Delta State",
    address: "Effurun–Sapele Rd, Warri",
    lga: "Warri South LGA",
    phone: "08051234092",
    respondingUnit: "Critical Infrastructure Prot. Squad",
    teamLead: "SC Adaeze Nwosu",
    responders: ["AC Ruth Okonkwo", "AC Tunde Bello"],
    vehicles: ["DT-NSC-007"],
  },
  {
    id: "u4",
    name: "Nigeria Immigration Service",
    agency: "Immigration",
    state: "Delta State",
    address: "Asaba-Onitsha Expressway, Asaba",
    lga: "Oshimili South LGA",
    phone: "08051234098",
    respondingUnit: "Border Patrol & Enforcement",
    teamLead: "CI Rebecca Amadi",
    responders: ["IO Daniel Uche"],
    vehicles: ["DT-IMM-032"],
  },
  {
    id: "u5",
    name: "Nigeria Customs Service",
    agency: "Nigeria Custom",
    state: "Delta State",
    address: "PTI Rd, Effurun",
    lga: "Uvwie LGA",
    phone: "08051234098",
    respondingUnit: "Anti-Smuggling Unit",
    teamLead: "AC Festus Osaghae",
    responders: ["CO Blessing Idris", "CO Ahmed Sule"],
    vehicles: ["DT-CUS-208"],
  },
  {
    id: "u6",
    name: "Nigeria Correctional Service",
    agency: "Correctional Service",
    state: "Delta State",
    address: "Airport Rd, Sapele",
    lga: "Sapele LGA",
    phone: "08051234098",
    respondingUnit: "Security & Custodial Squad",
    teamLead: "Supt. Anthony Ejeh",
    responders: ["ASC Mary Etim"],
    vehicles: ["DT-COR-051"],
  },
  {
    id: "u7",
    name: "NDLEA Delta State Command",
    agency: "NDLEA",
    state: "Delta State",
    address: "Okpanam Rd, Asaba",
    lga: "Oshimili South LGA",
    phone: "08051234098",
    respondingUnit: "Narcotic Enforcement Team",
    teamLead: "CE Josephine Nwosu",
    responders: ["NA Kelvin Obi", "NA Sandra Eze"],
    vehicles: ["DT-NDL-019"],
  },
  {
    id: "u8",
    name: "FRSC Unit Command – Warri",
    agency: "FRSC",
    state: "Delta State",
    address: "Effurun Roundabout, Effurun",
    lga: "Uvwie LGA",
    phone: "08051234098",
    respondingUnit: "Traffic Emergency Response",
    teamLead: "MC Samuel Oghenerukwe",
    responders: ["RC Joy Akpan"],
    vehicles: ["DT-FRS-077"],
  },
];

/* ------------------------------------------------------------------ *
 * Command centre operator profile
 * ------------------------------------------------------------------ */

export const commandOperator = {
  firstName: "David",
  lastName: "Doe",
  email: "david.doe@acme.com",
  contactEmail: "john.soe@gmail.com",
  phoneNumber: "+2348181804434",
  role: "Super Admin",
  serviceNumber: "NG-POL-49281",
  rank: "Inspector of Police (IP)",
  unit: "Delta State Patrol · Unit 04",
  yearsInService: "8 Years, 4 Months",
  supervisor: "DSP. O. Okafor",
  location: "Warri",
  avatar: "/avatar-placeholder.svg",
};
