import { db } from "./index";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
} from "firebase/firestore/lite";

// Service for classes collection — server-safe functions for Next.js API routes
export async function getClasses(includeDeleted = false) {
  try {
    const classesCol = collection(db, "classes");
    const snapshot = await getDocs(classesCol);
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (includeDeleted) return list;
    return list.filter((c) => !(c as any).deleted);
  } catch (err) {
    throw new Error("Failed to fetch classes");
  }
}

export async function getClassById(id: string, includeDeleted = false) {
  try {
    const ref = doc(db, "classes", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = { id: snap.id, ...snap.data() } as any;
    if (!includeDeleted && data.deleted) return null;
    return data;
  } catch (err) {
    throw new Error("Failed to fetch class");
  }
}

export async function createClass(data: Record<string, any>) {
  try {
    const col = collection(db, "classes");
    const ref = await addDoc(col, data);
    return { id: ref.id, ...data };
  } catch (err) {
    throw new Error("Failed to create class");
  }
}

export async function updateClass(id: string, data: Record<string, any>) {
  try {
    const ref = doc(db, "classes", id);
    await setDoc(ref, data, { merge: true } as any);
    return { id, ...data };
  } catch (err) {
    throw new Error("Failed to update class");
  }
}

export async function deleteClass(id: string) {
  try {
    const ref = doc(db, "classes", id);
    const now = new Date().toISOString();
    await setDoc(ref, { deleted: true, deleted_at: now }, {
      merge: true,
    } as any);
    return { id, deleted: true, deleted_at: now };
  } catch (err) {
    throw new Error("Failed to delete class");
  }
}

export default {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
};
