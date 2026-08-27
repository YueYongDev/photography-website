"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Laptop, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { UAParser } from "ua-parser-js";

import { Button } from "@/components/ui/button";
import styles from "@/modules/dashboard/ui/studio.module.css";
import { client } from "@/modules/auth/lib/auth-client";
import type { Session } from "../lib/auth-types";
import ChangePassword from "./dialogs/change-password";
import EditUserDialog from "./dialogs/edit-user";

const SecurityAccessCard = ({
  session,
  activeSessions,
}: {
  session: Session | null;
  activeSessions: Session["session"][];
}) => {
  const router = useRouter();
  const [isTerminating, setIsTerminating] = useState<string>();
  const sessionsWithDevices = activeSessions.filter((item) => item.userAgent);

  return (
    <div className={styles.securityStack}>
      <section className={styles.securitySection}>
        <div className={styles.securityHead}>
          <h3>Active sessions</h3>
          <p>{sessionsWithDevices.length} trusted device{sessionsWithDevices.length === 1 ? "" : "s"}</p>
        </div>

        <div className={styles.sessionList}>
          {sessionsWithDevices.map((activeSession) => {
            const parser = new UAParser(activeSession.userAgent || "");
            const device = parser.getDevice();
            const browser = parser.getBrowser();
            const operatingSystem = parser.getOS();
            const isCurrentSession = activeSession.id === session?.session.id;
            const isMobile = device.type === "mobile" || device.type === "tablet";
            const deviceName = isMobile
              ? [device.vendor, device.model].filter(Boolean).join(" ") || "Mobile device"
              : [browser.name, operatingSystem.name].filter(Boolean).join(" on ") || "Desktop browser";

            return (
              <div className={styles.sessionRow} key={activeSession.id}>
                <span className={styles.deviceMark} aria-hidden="true">
                  {isMobile ? <Smartphone size={15} /> : <Laptop size={15} />}
                </span>
                <div className={styles.sessionCopy}>
                  <strong>{deviceName}</strong>
                  <span>
                    {isCurrentSession ? <i className={styles.currentDot} /> : null}
                    {isCurrentSession ? "Current session" : "Authenticated session"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={styles.quietButton}
                  disabled={isTerminating === activeSession.id}
                  onClick={async () => {
                    setIsTerminating(activeSession.id);
                    const response = await client.revokeSession({ token: activeSession.token });

                    if (response.error) {
                      toast.error(response.error.message);
                    } else {
                      toast.success(
                        isCurrentSession
                          ? "Signed out successfully"
                          : "Session terminated successfully"
                      );
                    }

                    router.refresh();
                    setIsTerminating(undefined);
                  }}
                >
                  {isTerminating === activeSession.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : isCurrentSession ? (
                    "Sign out"
                  ) : (
                    "Terminate"
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.securitySection}>
        <div className={styles.securityHead}>
          <h3>Account details</h3>
          <p>Identity + password</p>
        </div>
        <div className={styles.accountActions}>
          <ChangePassword triggerClassName={styles.quietButton} />
          <EditUserDialog triggerClassName={styles.quietButton} />
        </div>
      </section>
    </div>
  );
};

export default SecurityAccessCard;
