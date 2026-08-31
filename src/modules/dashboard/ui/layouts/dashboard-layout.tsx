"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { DashboardNavbar } from "@/modules/dashboard/ui/components/dashboard-navbar";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";
import {
  StudioLocaleProvider,
  useStudioLocale,
} from "@/modules/dashboard/i18n/studio-locale";
import styles from "../studio.module.css";

const DashboardLayoutContent = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; image?: string | null };
}) => {
  const { locale } = useStudioLocale();
  const pathname = usePathname();
  const isPhotoEditor = /^\/studio\/photos\/[^/]+$/.test(pathname);

  return (
    <SidebarProvider
      className={styles.shell}
      data-locale={locale}
      data-photo-editor={isPhotoEditor || undefined}
      style={
        {
          "--sidebar-width": isPhotoEditor ? "14.5rem" : "17.5rem",
        } as React.CSSProperties
      }
    >
      <DashboardSidebar user={user} />
      <SidebarInset className={styles.workspace}>
        <DashboardNavbar user={user} />
        <div className={styles.workspaceMain}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export const DashboardLayout = (props: {
  children: React.ReactNode;
  user: { name: string; image?: string | null };
}) => (
  <StudioLocaleProvider>
    <DashboardLayoutContent {...props} />
  </StudioLocaleProvider>
);
