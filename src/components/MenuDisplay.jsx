import useMeals from "../hooks/useMeals";
import MealItem from "./MealItem";
import { Typography, Box, CircularProgress } from "@mui/material";

function MenuDisplay({ mealType, mealIds }) {
  const { meals, loading } = useMeals(mealIds);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom color="text.secondary">
        {mealType.charAt(0).toUpperCase() + mealType.slice(1)} Time!
      </Typography>
      {meals.length === 0 ? (
        <Typography color="text.secondary">No yummy meals yet!</Typography>
      ) : (
        meals.map((meal) => (
          <MealItem key={meal.id} meal={meal} mealType={mealType} />
        ))
      )}
    </Box>
  );
}

export default MenuDisplay;