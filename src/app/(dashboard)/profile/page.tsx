import SecurityAccessCard from "@/modules/auth/components/security-access-card";
import { auth, getCurrentSession } from "@/modules/auth/lib/auth";
import { headers } from "next/headers";
import { StudioPageHeader } from "@/modules/dashboard/ui/components/studio-page-header";
import styles from "@/modules/dashboard/ui/studio.module.css";

export const metadata = {
  title: "Security & Access",
};

const ProfilePage = async () => {
  const [session, activeSessions] = await Promise.all([
    getCurrentSession(),
    auth.api.listSessions({
      headers: await headers(),
    }),
  ]);

  return (
    <div className={styles.page}>
      <StudioPageHeader
        index="04"
        eyebrow="Account"
        title={<>Access, kept<br />private.</>}
        description="A quiet record of your profile and the devices trusted to enter the studio."
      />
      <div className={styles.profileGrid}>
        <aside className={styles.profileAside}>
          <h2>Your studio key.</h2>
          <p>
            Review signed-in devices, update your identity, or change the password
            that protects the private archive.
          </p>
        </aside>
        <SecurityAccessCard
          session={JSON.parse(JSON.stringify(session))}
          activeSessions={JSON.parse(JSON.stringify(activeSessions))}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
