// app/api/auth/delete-account/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, verifyPassword } from '@/lib/db/inMemoryStore';

export async function DELETE(request: NextRequest) {
  try {
    // Get the auth token from cookies - FIXED: using 'session' instead of 'auth-token'
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value; // CHANGED: 'session' not 'auth-token'

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    // Get session from token
    const session = db.sessions.get(sessionToken);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = db.users.get(session.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 400 }
      );
    }

    // Delete user from database
    const userDeleted = db.users.delete(session.userId);
    
    if (!userDeleted) {
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    // Delete user's sessions
    for (const [token, sess] of db.sessions.entries()) {
      if (sess.userId === session.userId) {
        db.sessions.delete(token);
      }
    }

    // Create response
    const response = NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    );

    // Clear session cookie - FIXED: using 'session' instead of 'auth-token'
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}