import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import UserButton from "@/modules/auth/components/user-button";
import { RiCameraLensFill } from "react-icons/ri";
import { PhotoUploadModal } from "../photo-upload-modal";

export const DashboardNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-background flex items-center px-2 pr-5 z-50 border-b shadow-md">
      <div className="flex items-center gap-4 w-full">
        {/* Menu & Logo */}
        <div className="flex items-center shrink-0">
          <SidebarTrigger />
          <Link href="/dashboard">
            <div className="flex items-center gap-1 p-4">
              <RiCameraLensFill size={32} />
              <p className="text-xl font-semibold tracking-tight">Studio</p>
            </div>
          </Link>
        </div>

        {/* Space */}
        <div className="flex-1" />

        {/* Profile & Auth */}
        <div className="shrink-0 items-center flex gap-4">
          <PhotoUploadModal />
          <UserButton />
        </div>
      </div>
    </nav>
  );
};
