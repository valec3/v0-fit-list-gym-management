import { NextResponse } from "next/server";
import {
  getPaymentById,
  updatePayment,
  deletePayment,
} from "../../../../services/firebase/payment";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const payment = await getPaymentById(id);
    if (!payment)
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    return NextResponse.json({ success: true, data: payment });
  } catch (err) {
    console.error("/api/payments/[id] GET error:", err);
    return NextResponse.json(
      { success: false, message: "Error fetching payment" },
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
    const updated = await updatePayment(id, body as Record<string, any>);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("/api/payments/[id] PUT error:", err);
    return NextResponse.json(
      { success: false, message: "Error updating payment" },
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
    const result = await deletePayment(id);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("/api/payments/[id] DELETE error:", err);
    return NextResponse.json(
      { success: false, message: "Error deleting payment" },
      { status: 500 }
    );
  }
}
