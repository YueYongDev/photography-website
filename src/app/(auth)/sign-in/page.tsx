import { Metadata } from "next";
import { redirect } from "next/navigation";
import SignIn from "@/modules/auth/components/sign-in";
import { getCurrentSession } from "@/modules/auth/lib/auth";

export const metadata: Metadata = {
  title: "Sign In",
};

const SignInPage = async () => {
  const session = await getCurrentSession();

  if (session) {
    return redirect("/dashboard");
  }

  return <SignIn />;
};

export default SignInPage;
