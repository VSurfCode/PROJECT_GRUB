import { Typography, Card, CardContent } from "@mui/material";

function MealItem({ meal }) {
  return (
    <Card sx={{ mb: 2, bgcolor: "#ffffff" }}>
      <CardContent>
        <Typography variant="h6" color="text.primary">
          {meal.name}
        </Typography>
        <Typography variant="body2" color="text.primary">
          {meal.description}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default MealItem;