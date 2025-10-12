// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/inMemoryStore";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value;
    
    console.log('Auth check - Token:', token ? 'exists' : 'missing');
    
    if (!token) {
      console.log('No session token found');
      return NextResponse.json({ user: null });
    }

    const session = db.sessions.get(token);
    console.log('Session found:', session ? 'yes' : 'no');
    
    if (!session) {
      console.log('Invalid session');
      return NextResponse.json({ user: null });
    }

    const user = db.users.get(session.userId);
    console.log('User found:', user ? 'yes' : 'no');
    
    if (!user) {
      console.log('User not found for session');
      return NextResponse.json({ user: null });
    }

    const { passwordHash, ...userWithoutPassword } = user;
    console.log('Auth successful for user:', user.username);
    
    return NextResponse.json({ user: userWithoutPassword });

  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ user: null });
  }
}