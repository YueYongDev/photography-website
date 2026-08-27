"use client";

import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import UserButton from "@/modules/auth/components/user-button";
import { ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import styles from "../../studio.module.css";

const routeLabels = [
  ["/dashboard", "Overview"],
  ["/photos", "Photographs"],
  ["/posts", "Stories"],
  ["/profile", "Account"],
] as const;

export const DashboardNavbar = ({
  user,
}: {
  user: { name: string; image?: string | null };
}) => {
  const pathname = usePathname();
  const currentSection =
    routeLabels.find(([href]) =>
      href === "/dashboard" ? pathname === href : pathname.startsWith(href)
    )?.[1] ?? "Studio";

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarTrail}>
        <SidebarTrigger className={styles.sidebarTrigger} />
        <strong>Studio</strong>
        <span>/</span>
        <span>{currentSection}</span>
      </div>

      <div className={styles.topbarActions}>
        <Link href="/" className={styles.liveLink}>
          View live site
          <ArrowUpRight size={13} />
        </Link>
        <div>
          <UserButton user={user} />
        </div>
      </div>
    </header>
  );
};
