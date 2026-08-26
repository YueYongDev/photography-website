import { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/modules/dashboard/ui/layouts/dashboard-layout";
import { getCurrentSession } from "@/modules/auth/lib/auth";

export const metadata: Metadata = {
  title: {
    template: "%s - Dashboard",
    default: "Dashboard",
  },
};

export const runtime = "nodejs";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  let session = null;

  try {
    session = await getCurrentSession();
  } catch {
    session = null;
  }

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout
      user={{
        name: session.user.name,
        image: session.user.image,
      }}
    >
      {children}
    </DashboardLayout>
  );
};

export default Layout;
