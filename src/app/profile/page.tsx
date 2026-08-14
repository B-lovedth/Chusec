import { PageShell } from "@/components/layout/PageShell";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { currentUser } from "@/data/dashboard";

export default function ProfilePage() {
  return (
    <PageShell title="My Profile" location={currentUser.location}>
      <ProfileForm />
    </PageShell>
  );
}
