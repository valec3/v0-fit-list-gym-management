import { NextResponse } from "next/server";
import {
  getClassById,
  updateClass,
  deleteClass,
} from "../../../../services/firebase/class";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const cls = await getClassById(id);
    if (!cls)
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    return NextResponse.json({ success: true, data: cls });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error fetching class" },
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
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 }
      );
    }
    const updated = await updateClass(id, body as Record<string, any>);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error updating class" },
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
    const result = await deleteClass(id);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error deleting class" },
      { status: 500 }
    );
  }
}
