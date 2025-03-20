import { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot, collection } from "firebase/firestore";
import { db } from "../../firebase";

function MenuManagement() {
  const [meals, setMeals] = useState([]);
  const [menu, setMenu] = useState({ breakfast: [], lunch: [], dinner: [] });

  useEffect(() => {
    const mealsUnsub = onSnapshot(collection(db, "meals"), (snapshot) => {
      setMeals(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    const menuUnsub = onSnapshot(doc(db, "currentMenu", "today"), (docSnap) => {
      setMenu(docSnap.exists() ? docSnap.data() : { breakfast: [], lunch: [], dinner: [] });
    });
    return () => {
      mealsUnsub();
      menuUnsub();
    };
  }, []);

  const updateMenu = async (mealType, mealId) => {
    const updated = { ...menu, [mealType]: menu[mealType].includes(mealId) ? menu[mealType].filter(id => id !== mealId) : [...menu[mealType], mealId] };
    setMenu(updated);
    await setDoc(doc(db, "currentMenu", "today"), updated);
  };

  return (
    <div>
      <h1>Menu Management</h1>
      {["breakfast", "lunch", "dinner"].map((type) => (
        <div key={type}>
          <h2>{type.charAt(0).toUpperCase() + type.slice(1)}</h2>
          {meals.map((meal) => (
            <label key={meal.id}>
              <input
                type="checkbox"
                checked={menu[type].includes(meal.id)}
                onChange={() => updateMenu(type, meal.id)}
              />
              {meal.name}
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}

export default MenuManagement;