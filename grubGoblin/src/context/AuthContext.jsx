import { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        setUser(userDoc.exists() ? { ...firebaseUser, ...userDoc.data() } : null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password) => {
    // Check if this is the first user
    const usersSnapshot = await getDocs(collection(db, "users"));
    const isFirstUser = usersSnapshot.empty;

    // Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // Add user to Firestore with isAdmin set to true for the first user
    await setDoc(doc(db, "users", newUser.uid), {
      email: newUser.email,
      isAdmin: isFirstUser,
    });

    // Update local state
    setUser({ ...newUser, email: newUser.email, isAdmin: isFirstUser });
  };

  const logout = () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}