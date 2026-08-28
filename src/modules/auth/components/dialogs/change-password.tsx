"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { client } from "@/modules/auth/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useStudioLocale } from "@/modules/dashboard/i18n/studio-locale";

const ChangePassword = ({ triggerClassName }: { triggerClassName?: string }) => {
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [signOutDevices, setSignOutDevices] = useState<boolean>(false);
  const { copy } = useStudioLocale();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn("gap-2", triggerClassName)} variant="outline" size="sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M2.5 18.5v-1h19v1zm.535-5.973l-.762-.442l.965-1.693h-1.93v-.884h1.93l-.965-1.642l.762-.443L4 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L4 10.835zm8 0l-.762-.442l.966-1.693H9.308v-.884h1.93l-.965-1.642l.762-.443L12 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L12 10.835zm8 0l-.762-.442l.966-1.693h-1.931v-.884h1.93l-.965-1.642l.762-.443L20 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L20 10.835z"
            ></path>
          </svg>
          <span className="text-sm">{copy.account.changePassword}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>{copy.account.changePassword}</DialogTitle>
          <DialogDescription>{copy.account.changePasswordDescription}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="current-password">{copy.account.currentPassword}</Label>
          <PasswordInput
            id="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="new-password"
            placeholder={copy.account.currentPassword}
          />
          <Label htmlFor="new-password">{copy.account.newPassword}</Label>
          <PasswordInput
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            placeholder={copy.account.newPassword}
          />
          <Label htmlFor="password">{copy.account.confirmPassword}</Label>
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            placeholder={copy.account.confirmPassword}
          />
          <div className="flex gap-2 items-center">
            <Checkbox
              onCheckedChange={(checked) =>
                checked ? setSignOutDevices(true) : setSignOutDevices(false)
              }
            />
            <p className="text-sm">{copy.account.signOutOtherDevices}</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={async () => {
              if (newPassword !== confirmPassword) {
                toast.error(copy.account.passwordsMismatch);
                return;
              }
              if (newPassword.length < 8) {
                toast.error(copy.account.passwordTooShort);
                return;
              }
              setLoading(true);
              const res = await client.changePassword({
                newPassword: newPassword,
                currentPassword: currentPassword,
                revokeOtherSessions: signOutDevices,
              });
              setLoading(false);
              if (res.error) {
                toast.error(
                  res.error.message ||
                    "Couldn't change your password! Make sure it's correct"
                );
              } else {
                setOpen(false);
                toast.success(copy.account.passwordChanged);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }
            }}
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              copy.account.changePassword
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePassword;
