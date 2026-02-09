import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json();

    const AUTH_SECRET = process.env.AUTH_SECRET;

    if (!AUTH_SECRET) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    if (secret === AUTH_SECRET) {
      // Generate a session token
      const sessionToken = crypto.randomBytes(32).toString("hex");

      return NextResponse.json(
        {
          success: true,
          token: sessionToken,
          message: "Authentication successful",
        },
        { status: 200 },
      );
    }

    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
