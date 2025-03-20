import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function useCurrentMenu() {
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    const docRef = doc(db, "currentMenu", "today");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      setMenu(docSnap.exists() ? docSnap.data() : { breakfast: [], lunch: [], dinner: [] });
    });
    return () => unsubscribe();
  }, []);

  return menu;
}

export default useCurrentMenu;