import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedNotifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(fetchedNotifications);
        setLoading(false);
      },
      (err) => {
        setError("Error fetching notifications: " + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { notifications, loading, error };
}

export default useNotifications;