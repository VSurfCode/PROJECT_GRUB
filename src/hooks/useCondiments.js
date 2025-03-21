import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function useCondiments() {
  const [condiments, setCondiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const condimentRef = doc(db, "condiments", "condiments");
    const unsubscribe = onSnapshot(
      condimentRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setCondiments(docSnap.data().items || []);
        } else {
          setCondiments([]);
        }
        setLoading(false);
      },
      (err) => {
        setError("Failed to fetch condiments: " + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { condiments, loading, error };
}

export default useCondiments;