import { db } from "./index";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  query,
  where,
} from "firebase/firestore/lite";
import { getMemberById } from "./member";

// Attendance service (server-only). Follows the same contract as other services.
export async function getAttendances(date?: string, includeDeleted = false) {
  try {
    const col = collection(db, "attendance");
    const snapshot = await getDocs(col);
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    let filtered: any[] = list as any[];
    if (date) {
      // keep entries whose check_in_time starts with the date (YYYY-MM-DD)
      filtered = filtered.filter((a: any) => a.check_in_time?.startsWith(date));
    }
    if (!includeDeleted) filtered = filtered.filter((a) => !a.deleted);
    return filtered;
  } catch (err) {
    throw new Error("Failed to fetch attendances");
  }
}

export async function getActiveAttendances() {
  try {
    const all = await getAttendances(undefined, false);
    return all.filter((a: any) => !a.check_out_time);
  } catch (err) {
    throw new Error("Failed to fetch active attendances");
  }
}

export async function getAttendanceById(id: string) {
  try {
    const ref = doc(db, "attendance", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as any;
  } catch (err) {
    throw new Error("Failed to fetch attendance");
  }
}

export async function createAttendance(data: Record<string, any>) {
  try {
    const col = collection(db, "attendance");
    const payload: Record<string, any> = { ...data };
    const now = new Date().toISOString();
    // Server controlled timestamps
    payload.check_in_time = now;
    payload.created_at = now;

    // If member_id provided, ensure member exists and prevent duplicate active attendance
    if (payload.member_id) {
      const member = await getMemberById(payload.member_id);
      if (!member) throw new Error("Member not found");
      payload.member = {
        id: member.id,
        first_name: (member as any).first_name,
        last_name: (member as any).last_name,
        member_number: (member as any).member_number,
      };

      // check for active attendance for this member
      const colRef = collection(db, "attendance");
      const q = query(colRef, where("member_id", "==", payload.member_id));
      const snap = await getDocs(q);
      const active = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as any))
        .find((a) => !a.check_out_time && !a.deleted);
      if (active) throw new Error("Member already checked in");
    }

    const ref = await addDoc(col, payload);
    return { id: ref.id, ...payload };
  } catch (err: any) {
    // rethrow with message for API mapping
    throw new Error(err?.message || "Failed to create attendance");
  }
}

export async function updateAttendance(id: string, data: Record<string, any>) {
  try {
    const ref = doc(db, "attendance", id);
    await setDoc(ref, data, { merge: true } as any);
    return { id, ...data };
  } catch (err) {
    throw new Error("Failed to update attendance");
  }
}

export async function checkOutAttendance(id: string) {
  try {
    const ref = doc(db, "attendance", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Attendance not found");
    const data = snap.data() as any;
    if (data.check_out_time) throw new Error("Already checked out");
    const now = new Date().toISOString();
    await setDoc(ref, { check_out_time: now, updated_at: now }, {
      merge: true,
    } as any);
    return { id, check_out_time: now };
  } catch (err: any) {
    throw new Error(err?.message || "Failed to checkout attendance");
  }
}

export async function deleteAttendance(id: string) {
  try {
    const ref = doc(db, "attendance", id);
    const now = new Date().toISOString();
    await setDoc(ref, { deleted: true, deleted_at: now }, {
      merge: true,
    } as any);
    return { id, deleted: true, deleted_at: now };
  } catch (err) {
    throw new Error("Failed to delete attendance");
  }
}

export default {
  getAttendances,
  getActiveAttendances,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  checkOutAttendance,
  deleteAttendance,
};
