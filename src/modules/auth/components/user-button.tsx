"use client";

import { signOut } from "@/modules/auth/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";

const UserButton = ({
  user,
}: {
  user: { name: string; image?: string | null };
}) => {
  const router = useRouter();
  const [isSignOut, setIsSignOut] = useState<boolean>(false);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-9 hover:opacity-80 transition-opacity cursor-pointer">
          <AvatarImage
            src={user.image || undefined}
            alt="Avatar"
            className="object-cover"
          />
          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <button
            className="w-full"
            onClick={async () => {
              setIsSignOut(true);
              await signOut({
                fetchOptions: {
                  onSuccess() {
                    router.push("/");
                  },
                },
              });
              setIsSignOut(false);
            }}
            disabled={isSignOut}
          >
            <span className="text-sm">
              {isSignOut ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <LogOut size={16} />
                  Sign Out
                </div>
              )}
            </span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
