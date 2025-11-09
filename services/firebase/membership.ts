import { db } from "./index";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
} from "firebase/firestore/lite";

// Service for memberships collection (server-safe). Uses soft-delete pattern.

export async function getMemberships(includeDeleted = false) {
  try {
    const col = collection(db, "memberships");
    const snap = await getDocs(col);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (includeDeleted) return list;
    return list.filter((m) => !(m as any).deleted);
  } catch (e) {
    throw new Error("Failed to fetch memberships");
  }
}

export async function getMembershipById(id: string, includeDeleted = false) {
  try {
    const ref = doc(db, "memberships", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = { id: snap.id, ...snap.data() } as any;
    if (!includeDeleted && data.deleted) return null;
    return data;
  } catch (e) {
    throw new Error("Failed to fetch membership");
  }
}

export async function createMembership(data: Record<string, any>) {
  try {
    const col = collection(db, "memberships");
    const now = new Date().toISOString();
    const payload = { ...data, created_at: now, updated_at: now };
    const ref = await addDoc(col, payload);
    return { id: ref.id, ...payload };
  } catch (e) {
    throw new Error("Failed to create membership");
  }
}

export async function updateMembership(id: string, data: Record<string, any>) {
  try {
    const ref = doc(db, "memberships", id);
    const payload = { ...data, updated_at: new Date().toISOString() };
    await setDoc(ref, payload, { merge: true } as any);
    return { id, ...payload };
  } catch (e) {
    throw new Error("Failed to update membership");
  }
}

export async function deleteMembership(id: string) {
  try {
    const ref = doc(db, "memberships", id);
    const now = new Date().toISOString();
    await setDoc(ref, { deleted: true, deleted_at: now }, {
      merge: true,
    } as any);
    return { id, deleted: true, deleted_at: now };
  } catch (e) {
    throw new Error("Failed to delete membership");
  }
}

export default {
  getMemberships,
  getMembershipById,
  createMembership,
  updateMembership,
  deleteMembership,
};
