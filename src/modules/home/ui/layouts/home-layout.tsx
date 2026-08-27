import { SiteShell } from "@/modules/site/ui/site-shell";

export const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return <SiteShell>{children}</SiteShell>;
};
