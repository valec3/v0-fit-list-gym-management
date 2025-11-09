import { NextResponse } from "next/server";
import {
  getMembershipById,
  updateMembership,
  deleteMembership,
} from "../../../../services/firebase/membership";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const item = await getMembershipById(id);
    if (!item)
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    return NextResponse.json({ success: true, data: item });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error fetching membership" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    if (!body || typeof body !== "object")
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 }
      );
    const updated = await updateMembership(id, body as Record<string, any>);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error updating membership" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const result = await deleteMembership(id);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error deleting membership" },
      { status: 500 }
    );
  }
}
