import { useState, useMemo, useEffect } from "react";
import useCurrentMenu from "../hooks/useCurrentMenu";
import useMeals from "../hooks/useMeals";
import useCondiments from "../hooks/useCondiments"; // Import the new useCondiments hook
import { useAuth } from "../context/AuthContext";
import { useBag } from "../context/BagContext";
import OrderForm from "../components/OrderForm";
import BeverageOrderForm from "../components/BeverageOrderForm";
import Bag from "../components/Bag";
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
  const [selectedBeverage, setSelectedBeverage] = useState(null);
  const [bagOpen, setBagOpen] = useState(false);
  const { user } = useAuth();
  const { bag, setBag } = useBag();
  const menu = useCurrentMenu();
  const mealIds = useMemo(() => {
    const ids = menu ? menu[mealType] || [] : [];
    console.log(`Meal IDs for ${mealType}:`, ids);
    return ids;
  }, [menu, mealType]);
  const { meals, loading: mealsLoading, error: mealsError } = useMeals(mealIds);
  const { condiments, loading: condimentsLoading, error: condimentsError } = useCondiments(); // Fetch global condiments

  useEffect(() => {
    console.log(`Meals for ${mealType}:`, meals);
  }, [meals, mealType]);

  const handleAddToBag = (bagItem) => {
    setBag((prev) => [...prev, bagItem]);
  };

  // Handle loading and error states for both meals and condiments
  if (mealsLoading || condimentsLoading || !menu) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "background.default" }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (mealsError) {
    return (
      <Box sx={{ p: 3, bgcolor: "background.default" }}>
        <Typography color="error">Error loading meals: {mealsError}</Typography>
      </Box>
    );
  }

  if (condimentsError) {
    return (
      <Box sx={{ p: 3, bgcolor: "background.default" }}>
        <Typography color="error">Error loading condiments: {condimentsError}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Sidebar for larger screens */}
      <Box
        sx={{
          maxWidth: 200,
          bgcolor: "#2a2e33",
          p: 2,
          pt: 3,
          color: "#ffffff",
          borderRight: "3px solid rgb(61, 246, 14)",
          display: { xs: "none", sm: "block" },
        }}
      >
        <Typography variant="h5" gutterBottom color="#fff">
          Meal Times
        </Typography>
        {["breakfast", "lunch", "dinner", "beverages"].map((type) => (
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

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          ml: { xs: 0 },
          p: 3,
          bgcolor: "background.default",
        }}
      >
        {/* Meal Type Buttons for Small Screens */}
        <Box
          sx={{
            display: { xs: "flex", sm: "none" },
            justifyContent: "center",
            bgcolor: "#2a2e33",
            p: 1,
            mb: 2,
            gap: 1.5,
            borderRadius: 1,
          }}
        >
          {["breakfast", "lunch", "dinner", "beverages"].map((type) => (
            <Button
              key={type}
              onClick={() => setMealType(type)}
              variant={mealType === type ? "contained" : "outlined"}
              color="primary"
              aria-label={`Select ${type} meal type`}
              sx={{
                flexShrink: 0,
                bgcolor: mealType === type ? "#0fff50" : "transparent",
                color: mealType === type ? "#000000" : "#ffffff",
                borderColor: "#0fff50",
                "&:hover": {
                  bgcolor: mealType === type ? "#0fff50" : "#3a3e43",
                  borderColor: "#0fff50",
                },
                px: 2,
                py: 1,
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
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
        </Box>

        <Typography variant="h4" gutterBottom color="text.secondary">
          {mealType.charAt(0).toUpperCase() + mealType.slice(1)} Time!
        </Typography>
        {meals.length === 0 ? (
          <Typography color="text.secondary">No yummy items yet!</Typography>
        ) : (
          <Grid container spacing={3}>
            {meals.map((meal) => (
              <Grid item xs={12} md={6} lg={4} key={meal.id}>
                <Card sx={{ bgcolor: "#ffffff", cursor: "pointer", transition: "transform 0.2s", minHeight: "380px", display: "flex", flexDirection: "column", justifyContent: "space-between", textAlign: 'center', "&:hover": { transform: "scale(1.05)" } }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={meal.imageUrl || "https://via.placeholder.com/150"}
                    alt={meal.name}
                    onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent>
                    <Typography variant="h6" color="text.primary" sx={{justifySelf: 'flex-start'}}>
                      {meal.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{p:3}}>
                      {meal.description || "A yummy treat!"}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() =>
                        meal.category === "beverage"
                          ? setSelectedBeverage(meal)
                          : setSelectedMeal(meal)
                      }
                    >
                      Add to Bag
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {selectedMeal && (
        <OrderForm
          meal={selectedMeal}
          mealType={mealType}
          condiments={condiments} // Pass the global condiments list
          onClose={() => setSelectedMeal(null)}
          onAddToBag={handleAddToBag}
        />
      )}

      {selectedBeverage && (
        <BeverageOrderForm
          beverage={selectedBeverage}
          condiments={condiments} // Pass the global condiments list
          onClose={() => setSelectedBeverage(null)}
          onAddToBag={handleAddToBag}
        />
      )}

      <Bag
        open={bagOpen}
        onClose={() => setBagOpen(false)}
        bag={bag}
        setBag={setBag}
        user={user}
      />
    </Box>
  );
}

export default Home;