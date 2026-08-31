import { Metadata } from "next";
import { redirect, unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { DashboardLayout } from "@/modules/dashboard/ui/layouts/dashboard-layout";
import { getCurrentSession } from "@/modules/auth/lib/auth";

export const metadata: Metadata = {
  title: {
    template: "%s — Studio",
    default: "Studio",
  },
};

export const runtime = "nodejs";

const DashboardRouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
    <div
      className="flex flex-col items-center gap-4 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="size-8 animate-spin rounded-full border border-neutral-200 border-t-neutral-900" />
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.2em]">YUEYONG STUDIO</p>
        <p className="text-sm text-muted-foreground">Opening your archive…</p>
      </div>
    </div>
  </div>
);

const DashboardSessionError = () => (
  <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
    <div className="max-w-sm space-y-5 text-center">
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.2em]">YUEYONG STUDIO</p>
        <h1 className="text-2xl font-medium tracking-tight">
          The studio could not be opened
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          The session service did not respond. Your login has not been cleared.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3">
        <a
          href="/studio/overview"
          className="rounded-full bg-foreground px-5 py-2.5 text-sm text-background"
        >
          Try again
        </a>
        <a
          href="/"
          className="rounded-full border border-border px-5 py-2.5 text-sm"
        >
          Back to site
        </a>
      </div>
    </div>
  </div>
);

const AuthenticatedDashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  let session;

  try {
    session = await getCurrentSession();
  } catch (error) {
    unstable_rethrow(error);
    // A transient database/auth failure is not evidence that the user signed
    // out. Redirecting here would create a sign-in loop.
    console.error("Unable to resolve the dashboard session", error);
    return <DashboardSessionError />;
  }

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout
      user={{
        name: session.user.name,
        image: session.user.image,
      }}
    >
      {children}
    </DashboardLayout>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<DashboardRouteFallback />}>
    <AuthenticatedDashboardLayout>{children}</AuthenticatedDashboardLayout>
  </Suspense>
);

export default Layout;
