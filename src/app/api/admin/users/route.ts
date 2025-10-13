// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { 
  adminGetAllUsers, 
  adminUpdateUser, 
  adminDeleteUser, 
  adminToggleAdminStatus,
  createUser 
} from "@/lib/db/inMemoryStore";
import bcryptjs from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering/pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    let users = adminGetAllUsers();

    // Apply search filter
    if (search) {
      users = users.filter(user => 
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    return NextResponse.json({
      users: paginatedUsers,
      total: users.length,
      page,
      totalPages: Math.ceil(users.length / limit),
      hasNext: endIndex < users.length,
      hasPrev: page > 1
    }, { status: 200 });

  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    // Hash password
    const passwordHash = await bcryptjs.hash(userData.password, 12);

    const result = createUser({
      username: userData.username,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      gender: userData.gender,
      passwordHash,
      isAdmin: userData.isAdmin || false
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    const { passwordHash: _, ...userWithoutPassword } = result.user!;

    return NextResponse.json(
      { 
        message: "User created successfully",
        user: userWithoutPassword
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, updates } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Remove fields that shouldn't be updated
    const { id, passwordHash, createdAt, ...allowedUpdates } = updates;

    const result = adminUpdateUser(userId, allowedUpdates);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: "User updated successfully",
        user: result.user 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const currentAdminId = "admin-1";

    const result = adminDeleteUser(userId, currentAdminId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: "User account deleted successfully",
        deletedUserId: userId,
        // Add this flag to trigger client-side cleanup
        needsBlogCleanup: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function PATCH(request: NextRequest) {
  try {
    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: "User ID and action are required" },
        { status: 400 }
      );
    }

    // In a real app, you'd get the current admin ID from the session
    const currentAdminId = "admin-1"; // This should come from session

    let result;
    
    switch (action) {
      case 'toggleAdmin':
        result = adminToggleAdminStatus(userId, currentAdminId);
        break;
      // Add more actions here if needed
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: "User updated successfully",
        user: result.user 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Patch user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}