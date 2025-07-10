import { Metadata } from "next";
import { DashboardLayout } from "@/modules/dashboard/ui/layouts/dashboard-layout";

export const metadata: Metadata = {
  title: {
    template: "%s - Dashboard",
    default: "Dashboard",
  },
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default Layout;
