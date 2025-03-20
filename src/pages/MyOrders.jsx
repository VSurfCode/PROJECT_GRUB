import { useMemo } from "react";
import useOrders from "../hooks/useOrders";
import useMeals from "../hooks/useMeals";
import { useAuth } from "../context/AuthContext";
import { Typography, Box, Card, CardContent, CircularProgress } from "@mui/material";

function MyOrders() {
  const { user } = useAuth();
  const { orders, error: ordersError } = useOrders(user.uid);
  const mealIds = useMemo(() => orders.map((order) => order.mealId), [orders]);
  const { meals, loading: mealsLoading, error: mealsError } = useMeals(mealIds);

  if (ordersError) {
    return <Typography color="error" sx={{ p: 3 }}>Error loading orders: {ordersError}</Typography>;
  }
  if (mealsError) {
    return <Typography color="error" sx={{ p: 3 }}>Error loading meals: {mealsError}</Typography>;
  }
  if (mealsLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "background.default" }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: "background.default" }}>
      <Typography variant="h4" gutterBottom color="primary">
        My Orders
      </Typography>
      {orders.length === 0 ? (
        <Typography>No orders yet.</Typography>
      ) : (
        orders.map((order) => {
          const meal = meals.find((m) => m.id === order.mealId);
          return (
            <Card key={order.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">
                  {meal?.name || "Loading..."}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Meal Type: {order.mealType}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add-ons: {order.addOns.join(", ") || "None"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Time: {order.timestamp?.toDate().toLocaleString() || "N/A"}
                </Typography>
              </CardContent>
            </Card>
          );
        })
      )}
    </Box>
  );
}

export default MyOrders;