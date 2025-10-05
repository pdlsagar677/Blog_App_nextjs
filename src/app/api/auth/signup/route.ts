// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from 'bcryptjs';
import { createUser } from "@/lib/db/inMemoryStore";

export async function POST(request: NextRequest) {
  try {
    const { username, email, phoneNumber, gender, password } = await request.json();

    // Hash password before storing
    const passwordHash = await bcryptjs.hash(password, 12);

    const result = createUser({
      username,
      email,
      phoneNumber,
      gender,
      passwordHash,
      isAdmin: false
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}