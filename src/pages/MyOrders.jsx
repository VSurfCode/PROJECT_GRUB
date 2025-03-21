import { useMemo } from "react";
import useOrders from "../hooks/useOrders";
import useMeals from "../hooks/useMeals";
import { useAuth } from "../context/AuthContext";
import {
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function MyOrders() {
  const { user } = useAuth();
  const { orders, error: ordersError } = useOrders(user.uid);

  const mealIds = useMemo(() => {
    const ids = [];
    orders.forEach((order) => {
      order.items.forEach((item) => {
        ids.push(item.mealId);
      });
    });
    return [...new Set(ids)];
  }, [orders]);

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
          return (
            <Card
              key={order.id}
              sx={{
                mb: 2,
                bgcolor: order.status === "completed" ? "#e0ffe0" : "#ffffff",
                border: order.status === "completed" ? "2px solid #0fff50" : "none",
              }}
            >
              <CardContent>
                <Typography variant="h6" color="text.primary">
                  Order placed on {order.timestamp?.toDate().toLocaleString() || "N/A"}
                  {order.status === "completed" && (
                    <CheckCircleIcon sx={{ color: "#0fff50", ml: 1, verticalAlign: "middle" }} />
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Items:
                </Typography>
                <List dense>
                  {order.items.map((item, index) => {
                    const meal = meals.find((m) => m.id === item.mealId);
                    const condimentQuantities = item.condimentQuantities || {}; // Fallback to empty object
                    return (
                      <ListItem
                        key={index}
                        sx={{
                          bgcolor: "#2a2e33",
                          mb: 1,
                          borderRadius: 1,
                          border: "1px solid #0fff50",
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="h6" color="#0fff50">
                              {meal?.name || "Loading..."}
                            </Typography>
                          }
                          secondary={
                            item.type === "meal" ? (
                              <>
                                <Typography variant="body2" color="#ffffff">
                                  Quantities: {Object.entries(item.quantities)
                                    .map(([comp, qty]) => `${comp}: ${qty}`)
                                    .join(", ")}
                                </Typography>
                                <Typography variant="body2" color="#ffffff">
                                  Condiments: {Object.entries(condimentQuantities)
                                    .filter(([_, qty]) => qty > 0)
                                    .map(([condiment, qty]) => `${condiment}: ${qty}`)
                                    .join(", ") || "None"}
                                </Typography>
                                {item.notes && (
                                  <Typography variant="body2" color="#ffffff">
                                    Notes: {item.notes}
                                  </Typography>
                                )}
                              </>
                            ) : (
                              <>
                                <Typography variant="body2" color="#ffffff">
                                  Quantity: {item.quantity}
                                </Typography>
                                <Typography variant="body2" color="#ffffff">
                                  Condiments: {Object.entries(condimentQuantities)
                                    .filter(([_, qty]) => qty > 0)
                                    .map(([condiment, qty]) => `${condiment}: ${qty}`)
                                    .join(", ") || "None"}
                                </Typography>
                              </>
                            )
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          );
        })
      )}
    </Box>
  );
}

export default MyOrders;