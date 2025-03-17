import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function useMeals(mealIds) {
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    if (!mealIds || mealIds.length === 0) {
      setMeals([]);
      return;
    }
    const q = query(collection(db, "meals"), where("__name__", "in", mealIds));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mealsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMeals(mealsData);
    });
    return () => unsubscribe();
  }, [mealIds]);

  return meals;
}

export default useMeals;