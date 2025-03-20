import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function useMeals(mealIds) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("useMeals - mealIds:", mealIds);
    if (!mealIds || mealIds.length === 0) {
      setMeals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Batch mealIds into groups of 10 (Firestore "in" query limit)
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < mealIds.length; i += batchSize) {
      batches.push(mealIds.slice(i, i + batchSize));
    }

    const unsubscribes = [];
    Promise.all(
      batches.map((batch) => {
        const q = query(collection(db, "meals"), where("__name__", "in", batch));
        return new Promise((resolve) => {
          const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              const mealsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
              setMeals((prev) => {
                const newMeals = [...prev];
                mealsData.forEach((meal) => {
                  const index = newMeals.findIndex((m) => m.id === meal.id);
                  if (index === -1) {
                    newMeals.push(meal);
                  } else {
                    newMeals[index] = meal;
                  }
                });
                return newMeals;
              });
              resolve();
            },
            (err) => {
              console.error("useMeals - Error:", err);
              setError(err.message);
              resolve();
            }
          );
          unsubscribes.push(unsubscribe);
        });
      })
    ).finally(() => setLoading(false));

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [mealIds]);

  return { meals, loading, error };
}

export default useMeals;