import { redirect } from "next/navigation";

/** Profile moved under Settings; keep the old path working. */
export default function ProfilePage() {
  redirect("/settings");
}
