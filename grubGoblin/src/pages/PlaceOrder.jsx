import { useState } from "react";
import useCurrentMenu from "../hooks/useCurrentMenu";
import useMeals from "../hooks/useMeals";
import OrderForm from "../components/OrderForm";

function PlaceOrder() {
  const [mealType, setMealType] = useState("breakfast");
  const [selectedMeal, setSelectedMeal] = useState(null);
  const menu = useCurrentMenu();

  if (!menu) return <div>Loading menu...</div>;

  const mealIds = menu[mealType];
  const meals = useMeals(mealIds);

  return (
    <div>
      <h1>Place an Order</h1>
      <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
        <option value="breakfast">Breakfast</option>
        <option value="lunch">Lunch</option>
        <option value="dinner">Dinner</option>
      </select>
      {meals.map((meal) => (
        <div key={meal.id}>
          <h3>{meal.name}</h3>
          <p>{meal.description}</p>
          <button onClick={() => setSelectedMeal(meal)}>Order</button>
        </div>
      ))}
      {selectedMeal && (
        <OrderForm
          meal={selectedMeal}
          mealType={mealType}
          onClose={() => setSelectedMeal(null)}
        />
      )}
    </div>
  );
}

export default PlaceOrder;