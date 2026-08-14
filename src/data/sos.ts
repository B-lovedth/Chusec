export type SosRecipient = {
  id: string;
  label: string;
};

export const sosRecipients: SosRecipient[] = [
  { id: "emergency-units", label: "Emergency Units" },
  { id: "command-operators", label: "Command Operators" },
];
