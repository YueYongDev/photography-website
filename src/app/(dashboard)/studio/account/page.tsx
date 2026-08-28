import { StudioAccountView } from "@/modules/auth/components/studio-account-view";
import { getStudioAccountSessions } from "@/modules/auth/lib/auth";

export const metadata = { title: "Account" };

const StudioAccountPage = async () => {
  const { session, activeSessions } = await getStudioAccountSessions();

  return (
    <StudioAccountView
      session={JSON.parse(JSON.stringify(session))}
      activeSessions={JSON.parse(JSON.stringify(activeSessions))}
    />
  );
};

export default StudioAccountPage;
