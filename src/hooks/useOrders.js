import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function useOrders(userId) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let q;
    if (userId) {
      q = query(collection(db, "orders"), where("userId", "==", userId));
    } else {
      q = query(collection(db, "orders"));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);
      },
      (err) => {
        console.error("useOrders - Error:", err);
        setError(err.message);
      }
    );
    return () => unsubscribe();
  }, [userId]);

  return { orders, error };
}

export default useOrders;