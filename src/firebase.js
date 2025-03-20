import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Add Storage

const firebaseConfig = {
  apiKey: "AIzaSyDakJJRhI-3eNXkPoRfxI6UuEiqczxzxCY",
  authDomain: "projectgrub-b58cf.firebaseapp.com",
  projectId: "projectgrub-b58cf",
  storageBucket: "projectgrub-b58cf.firebasestorage.app",
  messagingSenderId: "532224209717",
  appId: "1:532224209717:web:f27e22178f6a129f48927c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Export storage