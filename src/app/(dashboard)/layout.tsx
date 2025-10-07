import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/modules/dashboard/ui/layouts/dashboard-layout";
import { auth } from "@/modules/auth/lib/auth";

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
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch {
    session = null;
  }

  if (!session) {
    redirect("/sign-in");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default Layout;
