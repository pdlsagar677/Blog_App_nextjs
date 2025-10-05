// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/inMemoryStore";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value;
    
    // Remove session from database
    if (token) {
      db.sessions.delete(token);
    }

    const response = NextResponse.json(
      { message: "Logout successful" },
      { status: 200 }
    );

    // Clear session cookie
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return response;

  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}