// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/inMemoryStore";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const isProtected = req.nextUrl.pathname.startsWith("/admin");

  if (isProtected) {
    const session = token ? db.sessions.get(token) : null;
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
