import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // Replace with your Firebase project config from the console
  apiKey: "AIzaSyDakJJRhI-3eNXkPoRfxI6UuEiqczxzxCY",
  authDomain: "projectgrub-b58cf.firebaseapp.com",
  projectId: "projectgrub-b58cf",
  // ... other config fields
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);