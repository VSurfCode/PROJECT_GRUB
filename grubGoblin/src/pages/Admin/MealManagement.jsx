import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

function MealManagement() {
  const [meals, setMeals] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [addOns, setAddOns] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "meals"), (snapshot) => {
      setMeals(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleAddMeal = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "meals"), {
      name,
      description,
      addOns: addOns.split(",").map((item) => item.trim()),
    });
    setName("");
    setDescription("");
    setAddOns("");
  };

  return (
    <div>
      <h1>Meal Management</h1>
      <form onSubmit={handleAddMeal}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Meal Name" required />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
        <input value={addOns} onChange={(e) => setAddOns(e.target.value)} placeholder="Add-ons (comma-separated)" />
        <button type="submit">Add Meal</button>
      </form>
      <h2>Existing Meals</h2>
      {meals.map((meal) => (
        <div key={meal.id}>
          <h3>{meal.name}</h3>
          <p>{meal.description}</p>
          <p>Add-ons: {meal.addOns.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}

export default MealManagement;