import { db } from "./index";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore/lite";

// Small wrapper service that exposes server-safe functions for Next.js API routes.
// Important contract:
// - Inputs: plain JS objects for member data, string IDs
// - Outputs: objects (including `id` when relevant) or throws Error on failure
// - Error mode: throws Error with a short message

export async function getMembers(includeDeleted = false) {
  try {
    const membersCollection = collection(db, "members");
    const membersSnapshot = await getDocs(membersCollection);
    const membersList = membersSnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    if (includeDeleted) return membersList;
    // filter out soft-deleted documents
    return membersList.filter((m) => !(m as any).deleted);
  } catch (error) {
    // preserve message for debugging in server logs
    throw new Error("Failed to fetch members");
  }
}

export async function getMemberById(id: string, includeDeleted = false) {
  try {
    const memberRef = doc(db, "members", id);
    const memberSnap = await getDoc(memberRef);
    if (!memberSnap.exists()) return null;
    const data = { id: memberSnap.id, ...memberSnap.data() } as any;
    if (!includeDeleted && data.deleted) return null;
    return data;
  } catch (error) {
    throw new Error("Failed to fetch member");
  }
}

export async function createMember(data: Record<string, any>) {
  try {
    const membersCollection = collection(db, "members");
    const docRef = await addDoc(membersCollection, data);
    return { id: docRef.id, ...data };
  } catch (error) {
    throw new Error("Failed to create member");
  }
}

export async function updateMember(id: string, data: Record<string, any>) {
  try {
    const memberRef = doc(db, "members", id);
    // Using setDoc with merge behaviour could be considered; updateDoc isn't in lite, so using setDoc
    await setDoc(memberRef, data, { merge: true } as any);
    return { id, ...data };
  } catch (error) {
    throw new Error("Failed to update member");
  }
}

export async function deleteMember(id: string) {
  try {
    const memberRef = doc(db, "members", id);
    // Soft delete: mark document as deleted with timestamp. This is safer for NoSQL
    const now = new Date().toISOString();
    await setDoc(memberRef, { deleted: true, deleted_at: now }, {
      merge: true,
    } as any);
    return { id, deleted: true, deleted_at: now };
  } catch (error) {
    throw new Error("Failed to delete member");
  }
}

export default {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
};
