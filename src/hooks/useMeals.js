import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function useMeals(mealIds) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mealIds || mealIds.length === 0) {
      setMeals([]);
      setLoading(false);
      console.log("No meal IDs provided, setting meals to empty.");
      return;
    }

    const validMealIds = mealIds.filter((id) => id && typeof id === "string");
    if (validMealIds.length === 0) {
      setMeals([]);
      setLoading(false);
      console.log("No valid meal IDs after filtering, setting meals to empty.");
      return;
    }

    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < validMealIds.length; i += chunkSize) {
      chunks.push(validMealIds.slice(i, i + chunkSize));
    }

    setLoading(true);
    const unsubscribers = chunks.map((chunk, index) => {
      const q = query(collection(db, "meals"), where("__name__", "in", chunk));
      return onSnapshot(
        q,
        (snapshot) => {
          const chunkMeals = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            category: doc.data().category || "meal", // Default to "meal" if category is not set
          }));
          console.log(`Fetched meals for chunk ${index + 1}:`, chunkMeals);

          setMeals((prevMeals) => {
            const allMeals = [...prevMeals];
            chunkMeals.forEach((meal) => {
              if (!allMeals.some((m) => m.id === meal.id)) {
                allMeals.push(meal);
              }
            });
            return validMealIds
              .map((id) => allMeals.find((meal) => meal.id === id))
              .filter((meal) => meal !== undefined);
          });

          setLoading(false);
        },
        (error) => {
          console.error("Error fetching meals:", error);
          setMeals([]);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [JSON.stringify(mealIds)]);

  return { meals, loading };
}

export default useMeals;