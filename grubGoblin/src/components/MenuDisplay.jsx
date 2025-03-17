import useMeals from "../hooks/useMeals";
import MealItem from "./MealItem";

function MenuDisplay({ mealType, mealIds }) {
  const meals = useMeals(mealIds);

  return (
    <div>
      <h2>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h2>
      {meals.length === 0 ? (
        <p>No meals available.</p>
      ) : (
        meals.map((meal) => <MealItem key={meal.id} meal={meal} mealType={mealType} />)
      )}
    </div>
  );
}

export default MenuDisplay;