import { NextResponse } from "next/server";
import {
  getMemberships,
  createMembership,
} from "../../../services/firebase/membership";

export async function GET() {
  try {
    const items = await getMemberships();
    return NextResponse.json({ success: true, data: items });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error fetching memberships" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 }
      );
    }
    const created = await createMembership(body as Record<string, any>);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error creating membership" },
      { status: 500 }
    );
  }
}
