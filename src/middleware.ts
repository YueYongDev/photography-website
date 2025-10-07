import { auth } from "@/modules/auth/lib/auth";
import { NextResponse, type NextRequest } from "next/server";

export default async function authMiddleware(request: NextRequest) {
  let session = null;

  try {
    session = await auth.api.getSession({
      // Pass through the original headers so the session cookie is available.
      headers: request.headers,
    });
  } catch {
    session = null;
  }

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/photos", "/documents", "/city", "/profile"],
};
