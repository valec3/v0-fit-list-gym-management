import { NextResponse } from "next/server";
import { getClasses, createClass } from "../../../services/firebase/class";

export async function GET() {
  try {
    const classes = await getClasses();
    return NextResponse.json({ success: true, data: classes });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error al obtener clases" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Payload inválido" },
        { status: 400 }
      );
    }
    const created = await createClass(body as Record<string, any>);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error al crear clase" },
      { status: 500 }
    );
  }
}
