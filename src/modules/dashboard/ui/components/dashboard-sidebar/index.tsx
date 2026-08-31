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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { UserAvatar } from "@/components/user-avatar";
import { useStudioLocale } from "@/modules/dashboard/i18n/studio-locale";
import styles from "../../studio.module.css";

export const DashboardSidebar = ({
  user,
}: {
  user: { name: string; image?: string | null };
}) => {
  const pathname = usePathname();
  const { isMobile, setOpenMobile, state } = useSidebar();
  const { copy } = useStudioLocale();
  const navigation = [
    { number: "01", ...copy.navigation.overview, href: "/studio/overview" },
    { number: "02", ...copy.navigation.photos, href: "/studio/photos" },
    { number: "03", ...copy.navigation.journeys, href: "/studio/journeys" },
    { number: "04", ...copy.navigation.account, href: "/studio/account" },
  ] as const;

  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar
      className={styles.sidebar}
      collapsible="offcanvas"
      mobileTitle={copy.shell.navigationTitle}
      mobileDescription={copy.shell.navigationDescription}
    >
      <SidebarHeader className={styles.sidebarHeader}>
        <Link
          href="/studio/overview"
          className={styles.sidebarBrand}
          onClick={closeOnMobile}
        >
          <span className={styles.brandMark}>YY</span>
          <span className={styles.brandCopy}>
            <strong>YUEYONG</strong>
            <span>{copy.shell.brandDetail}</span>
          </span>
        </Link>
        {(isMobile || state === "expanded") && (
          <SidebarTrigger
            className={`${styles.sidebarTrigger} ${styles.sidebarHeaderTrigger}`}
            label={copy.shell.toggleSidebar}
          />
        )}
      </SidebarHeader>

      <div className={styles.sidebarRule} />

      <SidebarContent className={styles.sidebarContent}>
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <p className={styles.sidebarLabel}>{copy.shell.workspace}</p>
            <SidebarMenu className={styles.sidebarMenu}>
              {navigation.map((item) => {
                const isActive =
                  item.href === "/studio/overview"
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
                      <Link
                        href={item.href}
                        prefetch={
                          item.href === "/studio/photos" ? true : undefined
                        }
                        onClick={closeOnMobile}
                      >
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
          href="/studio/account"
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
            <span>{copy.shell.archiveOwner}</span>
          </div>
        </Link>
        <Link href="/" className={styles.exitLink} onClick={closeOnMobile}>
          {copy.shell.publicArchive}
          <ArrowUpRight size={13} />
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
};
