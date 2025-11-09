import { NextResponse } from "next/server";
import {
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  checkOutAttendance,
} from "../../../../services/firebase/attendance";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const item = await getAttendanceById(id);
    if (!item)
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    return NextResponse.json({ success: true, data: item });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error fetching attendance" },
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
    // If body has checkout flag, perform checkout convenience
    if (body.checkout === true) {
      try {
        const data = await checkOutAttendance(id);
        return NextResponse.json({ success: true, data });
      } catch (err: any) {
        const msg = err?.message || "Error";
        if (msg.includes("Already checked out")) {
          return NextResponse.json(
            { success: false, message: msg },
            { status: 400 }
          );
        }
        if (msg.includes("Attendance not found")) {
          return NextResponse.json(
            { success: false, message: msg },
            { status: 404 }
          );
        }
        return NextResponse.json(
          { success: false, message: "Error updating attendance" },
          { status: 500 }
        );
      }
    }
    const updated = await updateAttendance(id, body as Record<string, any>);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error updating attendance" },
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
    const result = await deleteAttendance(id);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error deleting attendance" },
      { status: 500 }
    );
  }
}
