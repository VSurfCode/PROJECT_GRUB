import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function useUsers(userIds) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userIds || userIds.length === 0) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < userIds.length; i += batchSize) {
      batches.push(userIds.slice(i, i + batchSize));
    }

    const unsubscribes = [];
    Promise.all(
      batches.map((batch) => {
        const q = query(collection(db, "users"), where("__name__", "in", batch));
        return new Promise((resolve) => {
          const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              const usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
              setUsers((prev) => {
                const newUsers = [...prev];
                usersData.forEach((user) => {
                  const index = newUsers.findIndex((u) => u.id === user.id);
                  if (index === -1) {
                    newUsers.push(user);
                  } else {
                    newUsers[index] = user;
                  }
                });
                return newUsers;
              });
              resolve();
            },
            (err) => {
              console.error("useUsers - Error:", err);
              setError(err.message);
              resolve();
            }
          );
          unsubscribes.push(unsubscribe);
        });
      })
    ).finally(() => setLoading(false));

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [userIds]);

  return { users, loading, error };
}

export default useUsers;