import { getStudioAccountSessions } from "@/modules/auth/lib/auth";
import { StudioAccountView } from "@/modules/auth/components/studio-account-view";

export const metadata = {
  title: "Security & Access",
};

const ProfilePage = async () => {
  const { session, activeSessions } = await getStudioAccountSessions();

  return <StudioAccountView
    session={JSON.parse(JSON.stringify(session))}
    activeSessions={JSON.parse(JSON.stringify(activeSessions))}
  />;
};

export default ProfilePage;
