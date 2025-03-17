import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function useOrders(userId) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    if (userId) {
      q = query(collection(db, "orders"), where("userId", "==", userId), orderBy("timestamp", "desc"));
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    });
    return () => unsubscribe();
  }, [userId]);

  return orders;
}

export default useOrders;