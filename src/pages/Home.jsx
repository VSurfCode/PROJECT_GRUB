import { useState, useMemo } from "react";
import useCurrentMenu from "../hooks/useCurrentMenu";
import useMeals from "../hooks/useMeals";
import { useAuth } from "../context/AuthContext"; // Add useAuth
import OrderForm from "../components/OrderForm";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import { keyframes } from "@emotion/react";

// Define a bounce animation
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

function Home() {
  const [mealType, setMealType] = useState("breakfast");
  const [selectedMeal, setSelectedMeal] = useState(null);
  const { user } = useAuth(); // Get user from AuthContext
  const menu = useCurrentMenu();
  const mealIds = useMemo(() => (menu ? menu[mealType] : []), [menu, mealType]);
  const { meals, loading } = useMeals(mealIds);

  if (loading || !menu) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "background.default" }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh" }}>
      <Box
        sx={{
          width: 200,
          bgcolor: "#2a2e33",
          p: 2,
          color: "#ffffff",
          borderRight: "3px solid rgb(61, 246, 14)",
        }}
      >
        <Typography variant="h5" gutterBottom color="primary">
          Meal Times
        </Typography>
        {["breakfast", "lunch", "dinner"].map((type) => (
          <Button
            key={type}
            onClick={() => setMealType(type)}
            fullWidth
            variant={mealType === type ? "contained" : "outlined"}
            color="primary"
            sx={{
              mb: 1,
              bgcolor: mealType === type ? "#0fff50" : "transparent",
              color: mealType === type ? "#000000" : "#ffffff",
              borderColor: "#0fff50",
              "&:hover": {
                bgcolor: mealType === type ? "#0fff50" : "#3a3e43",
                borderColor: "#0fff50",
              },
            }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </Box>

      {/* Main Menu Grid */}
      <Box
        sx={{
          flexGrow: 1,
          ml: { xs: 0, sm: "200px" },
          p: 3,
          bgcolor: "background.default",
        }}
      >
        {/* Fun Welcome Message */}
        <Typography
          variant="h4"
          gutterBottom
          color="primary"
          sx={{
            animation: `${bounce} 2s infinite`,
            textAlign: "center",
            fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Arial', sans-serif",
            background: "linear-gradient(45deg, #0fff50, #ffc523)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 4,
          }}
        >
          Hey {user?.displayName || "Friend"}! Let’s Eat! 🎉
        </Typography>

        <Typography variant="h4" gutterBottom color="primary">
          {mealType.charAt(0).toUpperCase() + mealType.slice(1)} Time!
        </Typography>
        {meals.length === 0 ? (
          <Typography color="secondary">No yummy meals yet!</Typography>
        ) : (
          <Grid container spacing={3}>
            {meals.map((meal) => (
              <Grid item xs={12} md={5} key={meal.id}>
                <Card sx={{ bgcolor: "#ffffff", cursor: "pointer", transition: "transform 0.2s", "&:hover": { transform: "scale(1.05)" } }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={meal.imageUrl || "https://via.placeholder.com/150"}
                    alt={meal.name}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {meal.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {meal.description || "A yummy treat!"}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => setSelectedMeal(meal)}
                    >
                      Order Now!
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Order Form Dialog */}
      {selectedMeal && (
        <OrderForm
          meal={selectedMeal}
          mealType={mealType}
          onClose={() => setSelectedMeal(null)}
        />
      )}
    </Box>
  );
}

export default Home;