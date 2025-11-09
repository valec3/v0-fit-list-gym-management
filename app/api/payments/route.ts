import { NextResponse } from "next/server";
import { getPayments, createPayment } from "../../../services/firebase/payment";
import { z } from "zod";

const PaymentInput = z.object({
  member_id: z.union([z.string(), z.undefined(), z.null()]).optional(),
  membership_id: z.union([z.string(), z.undefined(), z.null()]).optional(),
  amount: z.number().optional(),
  payment_method: z.enum(["cash", "card", "transfer", "other"]),
  payment_date: z.string(),
  concept: z.string().min(1),
  notes: z.string().optional(),
  receipt_number: z.string().optional(),
});

export async function GET() {
  try {
    const payments = await getPayments();
    return NextResponse.json({ success: true, data: payments });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error fetching payments" },
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

    const parsed = PaymentInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.message },
        { status: 400 }
      );
    }

    const payload = parsed.data as Record<string, any>;
    // require amount if membership_id not provided
    if ((!payload.amount || payload.amount <= 0) && !payload.membership_id) {
      return NextResponse.json(
        {
          success: false,
          message: "amount must be > 0 or a membership_id must be provided",
        },
        { status: 400 }
      );
    }

    const created = await createPayment(payload as Record<string, any>);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    // log server error for debugging
    console.error("/api/payments POST error:", err);
    // map known service messages
    if (
      err?.message === "Member not found" ||
      err?.message === "Membership not found"
    ) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: 404 }
      );
    }
    // pass through known messages if present
    return NextResponse.json(
      { success: false, message: err?.message || "Error creating payment" },
      { status: 500 }
    );
  }
}
