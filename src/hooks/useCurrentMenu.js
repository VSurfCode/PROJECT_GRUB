import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function useCurrentMenu() {
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "currentMenu", "today"), (docSnap) => {
      setMenu(
        docSnap.exists()
          ? docSnap.data()
          : { breakfast: [], lunch: [], dinner: [], beverages: [] }
      );
    });

    return () => unsub();
  }, []);

  return menu;
}

export default useCurrentMenu;