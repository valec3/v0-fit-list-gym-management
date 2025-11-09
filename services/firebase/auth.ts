import { app } from "./index";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

// Avoid calling getAuth at module import time (it may rely on browser APIs).
function getAuthInstance() {
  return getAuth(app);
}

class FirebaseAuthService {
  private auth;
  constructor() {
    this.auth = getAuthInstance();
  }
  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      throw new Error("Failed to sign in");
    }
  }

  async signUp(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      throw new Error("Failed to sign up");
    }
  }

  async signOut() {
    try {
      await firebaseSignOut(this.auth);
    } catch (error) {
      throw new Error("Failed to sign out");
    }
  }
}

const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
