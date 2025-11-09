import { db } from "./index";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
} from "firebase/firestore/lite";
import { getMemberById } from "./member";
import { getMembershipById } from "./membership";

// Payments service (server-only). Contract similar to other services:
// - Returns plain objects or throws Error with short message

export async function getPayments(includeDeleted = false) {
  try {
    const col = collection(db, "payments");
    const snap = await getDocs(col);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (includeDeleted) return list;
    return list.filter((p: any) => !p.deleted);
  } catch (err) {
    throw new Error("Failed to fetch payments");
  }
}

export async function getPaymentById(id: string) {
  try {
    const ref = doc(db, "payments", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as any;
  } catch (err) {
    throw new Error("Failed to fetch payment");
  }
}

export async function createPayment(data: Record<string, any>) {
  try {
    const col = collection(db, "payments");
    const payload: Record<string, any> = { ...data };
    const now = new Date().toISOString();
    payload.created_at = now;
    // default receipt_number if not provided
    if (!payload.receipt_number) payload.receipt_number = `PAY-${Date.now()}`;

    // If member_id provided, validate and denormalize member snapshot
    if (payload.member_id) {
      const member = await getMemberById(payload.member_id);
      if (!member) throw new Error("Member not found");
      payload.member = {
        id: member.id,
        first_name: (member as any).first_name ?? null,
        last_name: (member as any).last_name ?? null,
        member_number: (member as any).member_number ?? null,
      };
    }

    // If membership_id provided, attach membership snapshot and try to derive amount if missing
    if (payload.membership_id) {
      const membership = await getMembershipById(payload.membership_id);
      if (!membership) throw new Error("Membership not found");
      payload.membership = membership;
      // try to derive amount from membership if client didn't provide amount
      if (
        (!payload.amount || payload.amount === 0) &&
        membership.membership_type
      ) {
        const mt = (membership as any).membership_type;
        if (mt && typeof mt.price === "number") payload.amount = mt.price;
      }
    }

    // Firestore rejects undefined values; sanitize payload by removing undefined properties
    function removeUndefined(obj: any) {
      if (obj && typeof obj === "object") {
        Object.keys(obj).forEach((k) => {
          const v = obj[k];
          if (v === undefined) {
            delete obj[k];
          } else if (v && typeof v === "object") {
            removeUndefined(v);
          }
        });
      }
    }

    removeUndefined(payload);

    const ref = await addDoc(col, payload);
    return { id: ref.id, ...payload };
  } catch (err: any) {
    throw new Error(err?.message || "Failed to create payment");
  }
}

export async function updatePayment(id: string, data: Record<string, any>) {
  try {
    const ref = doc(db, "payments", id);
    await setDoc(ref, data, { merge: true } as any);
    return { id, ...data };
  } catch (err) {
    throw new Error("Failed to update payment");
  }
}

export async function deletePayment(id: string) {
  try {
    const ref = doc(db, "payments", id);
    const now = new Date().toISOString();
    await setDoc(ref, { deleted: true, deleted_at: now }, {
      merge: true,
    } as any);
    return { id, deleted: true, deleted_at: now };
  } catch (err) {
    throw new Error("Failed to delete payment");
  }
}

export default {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
};
