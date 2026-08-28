import {
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/user-avatar";

import Link from "next/link";

export const DashboardSidebarHeader = ({
  user,
}: {
  user: { name: string; image?: string | null };
}) => {
  const { state } = useSidebar();

  if (state === "collapsed")
    return (
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="Your Profile" asChild>
          <Link href="/studio/account">
            <UserAvatar
              imageUrl={user.image || ""}
              name={user.name ?? "User"}
              size="xs"
            />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );

  return (
    <SidebarHeader className="flex items-center justify-between pb-4">
      <Link href="/studio/account">
        <UserAvatar
          imageUrl={user.image || ""}
          name={user.name ?? "User"}
          className="size-[112px] hover:opacity-80 transition-opacity"
        />
      </Link>
      <div className="flex flex-col items-center mt-2 gap-y-1">
        <p className="text-sm font-medium">Your Profile</p>
        <p className="text-xs text-muted-foreground">{user.name}</p>
      </div>
    </SidebarHeader>
  );
};
