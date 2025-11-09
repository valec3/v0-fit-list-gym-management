import { NextResponse } from "next/server";
import { getMembers, createMember } from "../../../services/firebase/member";

// GET /api/members
export async function GET() {
  try {
    const members = await getMembers();
    return NextResponse.json({ success: true, data: members });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error al obtener miembros" },
      { status: 500 }
    );
  }
}

// POST /api/members
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Payload inválido" },
        { status: 400 }
      );
    }

    const created = await createMember(body as Record<string, any>);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error al crear miembro" },
      { status: 500 }
    );
  }
}
