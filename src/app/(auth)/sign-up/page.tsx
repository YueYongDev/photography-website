import { Metadata } from "next";
import { redirect } from "next/navigation";
import SignUp from "@/modules/auth/components/sign-up";
import { getCurrentSession } from "@/modules/auth/lib/auth";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema/users";

export const metadata: Metadata = {
  title: "Sign Up",
};

// This route checks live account state and must never run its database query
// during the production build.
export const dynamic = "force-dynamic";

const SignUpPage = async () => {
  const session = await getCurrentSession();

  if (session) {
    return redirect("/dashboard");
  }

  const existingUser = await db
    .select({ id: user.id })
    .from(user)
    .limit(1);

  if (existingUser.length > 0) {
    return redirect("/sign-in");
  }

  return <SignUp />;
};

export default SignUpPage;
