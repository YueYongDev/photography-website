"use client";

import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { UserAvatar } from "@/components/user-avatar";
import styles from "../../studio.module.css";

const navigation = [
  {
    number: "01",
    label: "Overview",
    note: "Archive status",
    href: "/dashboard",
  },
  {
    number: "02",
    label: "Photographs",
    note: "Contact sheets",
    href: "/photos",
  },
  {
    number: "03",
    label: "Stories",
    note: "Journeys & notes",
    href: "/posts",
  },
  {
    number: "04",
    label: "Account",
    note: "Access & profile",
    href: "/profile",
  },
] as const;

export const DashboardSidebar = ({
  user,
}: {
  user: { name: string; image?: string | null };
}) => {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar className={styles.sidebar} collapsible="offcanvas">
      <SidebarHeader className={styles.sidebarHeader}>
        <Link
          href="/dashboard"
          className={styles.sidebarBrand}
          onClick={closeOnMobile}
        >
          <span className={styles.brandMark}>YY</span>
          <span className={styles.brandCopy}>
            <strong>YUEYONG</strong>
            <span>Photographic studio</span>
          </span>
        </Link>
      </SidebarHeader>

      <div className={styles.sidebarRule} />

      <SidebarContent className={styles.sidebarContent}>
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <p className={styles.sidebarLabel}>Workspace</p>
            <SidebarMenu className={styles.sidebarMenu}>
              {navigation.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      isActive={isActive}
                      asChild
                      className={styles.sidebarNavLink}
                    >
                      <Link href={item.href} onClick={closeOnMobile}>
                        <span className={styles.navNumber}>{item.number}</span>
                        <span className={styles.navCopy}>
                          <strong>{item.label}</strong>
                          <small>{item.note}</small>
                        </span>
                        <span className={styles.navDot} />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={styles.sidebarFooter}>
        <Link
          href="/profile"
          className={styles.profileLink}
          onClick={closeOnMobile}
        >
          <UserAvatar
            imageUrl={user.image || ""}
            name={user.name ?? "User"}
            className="size-9"
          />
          <div>
            <strong>{user.name}</strong>
            <span>Archive owner</span>
          </div>
        </Link>
        <Link href="/" className={styles.exitLink} onClick={closeOnMobile}>
          Public archive
          <ArrowUpRight size={13} />
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
};
