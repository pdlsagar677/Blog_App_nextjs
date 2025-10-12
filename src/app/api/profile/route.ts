// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/inMemoryStore";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const session = db.sessions.get(token);
    if (!session) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    const user = db.users.get(session.userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });

  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const session = db.sessions.get(token);
    if (!session) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    const user = db.users.get(session.userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { username, email, phoneNumber } = body;

    if (!username?.trim() || !email?.trim() || !phoneNumber?.trim()) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Phone number must be exactly 10 digits" },
        { status: 400 }
      );
    }

    // Check if username is taken by another user
    if (username !== user.username) {
      const existingUser = [...db.users.values()].find(u => 
        u.username.toLowerCase() === username.toLowerCase() && u.id !== user.id
      );
      if (existingUser) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
    }

    // Check if email is taken by another user
    if (email !== user.email) {
      const existingUser = [...db.users.values()].find(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.id !== user.id
      );
      if (existingUser) {
        return NextResponse.json(
          { error: "Email already taken" },
          { status: 400 }
        );
      }
    }

    // Check if phone number is taken by another user
    if (phoneNumber !== user.phoneNumber) {
      const existingUser = [...db.users.values()].find(u => 
        u.phoneNumber === phoneNumber && u.id !== user.id
      );
      if (existingUser) {
        return NextResponse.json(
          { error: "Phone number already taken" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = {
      ...user,
      username: username.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
    };

    db.users.set(user.id, updatedUser);

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return NextResponse.json({ 
      user: userWithoutPassword,
      message: "Profile updated successfully" 
    });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}