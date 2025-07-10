"use client";

import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Book,
  ImageIcon,
  LayoutDashboard,
  LogOutIcon,
  User2Icon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { DashboardSidebarHeader } from "./dashboard-siderbar-header";

export const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar className="pt-16 z-40" collapsible="icon">
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <DashboardSidebarHeader />
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Dashboard"
                  isActive={pathname === "/dashboard"}
                  asChild
                >
                  <Link href="/dashboard" className="flex items-center gap-4">
                    <LayoutDashboard className="size-4" />
                    <span className="text-sm">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Photos"
                  isActive={pathname.startsWith("/photos")}
                  asChild
                >
                  <Link href="/photos" className="flex items-center gap-4">
                    <ImageIcon className="size-4" />
                    <span className="text-sm">Photos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Posts"
                  isActive={pathname.startsWith("/posts")}
                  asChild
                >
                  <Link href="/posts" className="flex items-center gap-4">
                    <Book className="size-4" />
                    <span className="text-sm">Posts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Profile"
                  isActive={pathname === "/profile"}
                  asChild
                >
                  <Link href="/profile" className="flex items-center gap-4">
                    <User2Icon className="size-4" />
                    <span className="text-sm">Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <div className="px-4 w-full">
                <Separator />
              </div>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Exit Studio" asChild>
                  <Link href="/" className="flex items-center gap-4">
                    <LogOutIcon className="size-4" />
                    <span className="text-sm">Exit Studio</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
