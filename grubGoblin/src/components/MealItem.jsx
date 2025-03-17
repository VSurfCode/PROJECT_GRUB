function MealItem({ meal }) {
    return (
      <div>
        <h3>{meal.name}</h3>
        <p>{meal.description}</p>
      </div>
    );
  }
  
  export default MealItem;