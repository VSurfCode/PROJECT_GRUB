import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useOrders from "../hooks/useOrders";
import useMeals from "../hooks/useMeals";
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
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

function MyOrders() {
  const { user } = useAuth();
  const { orders, error: ordersError } = useOrders(user?.uid);
  const navigate = useNavigate();

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
        orders.map((order) => (
          <Card
            key={order.id}
            sx={{
              mb: 2,
              bgcolor: order.status === "completed" ? "#e0ffe0" : order.status === "started" ? "#fff0e0" : "#ffffff",
              border: order.status === "completed" ? "2px solid #0fff50" : order.status === "started" ? "2px solid #ffa500" : "none",
              cursor: "pointer",
            }}
            onClick={() => navigate(`/my-orders/${order.id}`)}
          >
            <CardContent>
              <Typography variant="h6">
                Order #{order.id}
                {order.status === "completed" && (
                  <CheckCircleIcon sx={{ color: "#0fff50", ml: 1, verticalAlign: "middle" }} />
                )}
                {order.status === "started" && (
                  <PlayArrowIcon sx={{ color: "#ffa500", ml: 1, verticalAlign: "middle" }} />
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Time: {order.timestamp?.toDate().toLocaleString() || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Items:
              </Typography>
              <List dense>
                {order.items.map((item, index) => {
                  const meal = meals.find((m) => m.id === item.mealId);
                  const condimentQuantities = item.condimentQuantities || {};
                  const addOnQuantities = item.addOnQuantities || {};
                  return (
                    <ListItem key={index}>
                      <ListItemText
                        primary={meal?.name || "Loading..."}
                        secondary={
                          item.type === "meal"
                            ? `Quantities: ${Object.entries(item.quantities)
                                .map(([comp, qty]) => `${comp}: ${qty}`)
                                .join(", ")} | Add-Ons: ${
                                Object.entries(addOnQuantities)
                                  .filter(([_, qty]) => qty > 0)
                                  .map(([addOn, qty]) => `${addOn}: ${qty}`)
                                  .join(", ") || "None"
                              } | Condiments: ${
                                Object.entries(condimentQuantities)
                                  .filter(([_, qty]) => qty > 0)
                                  .map(([condiment, qty]) => `${condiment}: ${qty}`)
                                  .join(", ") || "None"
                              }${item.notes ? ` | Notes: ${item.notes}` : ""}`
                            : `Quantity: ${item.quantity} | Add-Ons: ${
                                Object.entries(addOnQuantities)
                                  .filter(([_, qty]) => qty > 0)
                                  .map(([addOn, qty]) => `${addOn}: ${qty}`)
                                  .join(", ") || "None"
                              } | Condiments: ${
                                Object.entries(condimentQuantities)
                                  .filter(([_, qty]) => qty > 0)
                                  .map(([condiment, qty]) => `${condiment}: ${qty}`)
                                  .join(", ") || "None"
                              }`
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}

export default MyOrders;