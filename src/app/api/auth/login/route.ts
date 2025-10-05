// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from 'bcryptjs';
import { findUserByEmail, findUserByUsername, db } from "@/lib/db/inMemoryStore";

export async function POST(request: NextRequest) {
  try {
    const { emailOrUsername, password } = await request.json();

    // Validation checks
    const errors: Record<string, string> = {};

    if (!emailOrUsername?.trim()) {
      errors.emailOrUsername = "Email or username is required";
    }

    if (!password?.trim()) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          errors 
        },
        { status: 400 }
      );
    }

    // Find user
    let user;
    const cleanInput = emailOrUsername.trim();
    
    if (cleanInput.includes('@')) {
      user = findUserByEmail(cleanInput);
      if (!user) {
        return NextResponse.json(
          { 
            error: "Invalid credentials",
            errors: { emailOrUsername: "No account found with this email" }
          },
          { status: 401 }
        );
      }
    } else {
      user = findUserByUsername(cleanInput);
      if (!user) {
        return NextResponse.json(
          { 
            error: "Invalid credentials",
            errors: { emailOrUsername: "No account found with this username" }
          },
          { status: 401 }
        );
      }
    }

    // Verify password with bcryptjs
    const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          error: "Invalid credentials",
          errors: { password: "Incorrect password" }
        },
        { status: 401 }
      );
    }

    // Create session token
    const sessionToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
    
    // Store session in database
    const session = {
      token: sessionToken,
      userId: user.id,
      createdAt: Date.now(),
    };
    db.sessions.set(sessionToken, session);

    // Prepare user data for response (exclude sensitive info)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json(
      { 
        message: "Login successful",
        user: userData
      },
      { status: 200 }
    );

    // Set secure session cookie
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}