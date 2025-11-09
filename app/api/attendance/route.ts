import { NextResponse } from "next/server";
import {
  getAttendances,
  createAttendance,
  getActiveAttendances,
} from "../../../services/firebase/attendance";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get("date") || undefined;
    const active = url.searchParams.get("active");
    if (active === "true") {
      const act = await getActiveAttendances();
      return NextResponse.json({ success: true, data: act });
    }
    const list = await getAttendances(date);
    return NextResponse.json({ success: true, data: list });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error al obtener asistencias" },
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
    try {
      const created = await createAttendance(body as Record<string, any>);
      return NextResponse.json(
        { success: true, data: created },
        { status: 201 }
      );
    } catch (err: any) {
      const msg = err?.message || "Error creating";
      if (msg.includes("already checked in")) {
        return NextResponse.json(
          { success: false, message: msg },
          { status: 409 }
        );
      }
      if (msg.includes("Member not found")) {
        return NextResponse.json(
          { success: false, message: msg },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, message: "Error al crear asistencia" },
        { status: 500 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error al crear asistencia" },
      { status: 500 }
    );
  }
}
