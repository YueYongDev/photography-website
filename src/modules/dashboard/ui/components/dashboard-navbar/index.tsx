"use client";

import Link from "next/link";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import UserButton from "@/modules/auth/components/user-button";
import { ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import styles from "../../studio.module.css";
import { useStudioLocale } from "@/modules/dashboard/i18n/studio-locale";

export const DashboardNavbar = ({
  user,
}: {
  user: { name: string; image?: string | null };
}) => {
  const pathname = usePathname();
  const { isMobile, state } = useSidebar();
  const { copy, locale, setLocale } = useStudioLocale();
  const routeLabels = [
    ["/studio/overview", copy.navigation.overview.label],
    ["/studio/photos", copy.navigation.photos.label],
    ["/studio/journeys", copy.navigation.journeys.label],
    ["/studio/account", copy.navigation.account.label],
  ] as const;
  const currentSection =
    routeLabels.find(([href]) =>
      href === "/studio/overview" ? pathname === href : pathname.startsWith(href),
    )?.[1] ?? copy.shell.studio;

  if (/^\/studio\/photos\/[^/]+$/.test(pathname)) return null;

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarTrail}>
        {(isMobile || state === "collapsed") && (
          <SidebarTrigger
            className={styles.sidebarTrigger}
            label={copy.shell.toggleSidebar}
          />
        )}
        <strong>{copy.shell.studio}</strong>
        <span>/</span>
        <span>{currentSection}</span>
      </div>

      <div className={styles.topbarActions}>
        <div
          className={styles.languageSwitch}
          aria-label={copy.language.label}
          role="group"
        >
          <button
            type="button"
            aria-pressed={locale === "en"}
            className={locale === "en" ? styles.languageActive : ""}
            onClick={() => setLocale("en")}
          >
            {copy.language.english}
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            aria-pressed={locale === "zh-CN"}
            className={locale === "zh-CN" ? styles.languageActive : ""}
            onClick={() => setLocale("zh-CN")}
          >
            {copy.language.chinese}
          </button>
        </div>
        <Link href="/" className={styles.liveLink}>
          {copy.shell.viewSite}
          <ArrowUpRight size={13} />
        </Link>
        <div>
          <UserButton user={user} />
        </div>
      </div>
    </header>
  );
};
