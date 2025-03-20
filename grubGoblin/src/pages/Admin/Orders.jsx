import { useMemo } from "react";
import useOrders from "../../hooks/useOrders";
import useMeals from "../../hooks/useMeals";
import useUsers from "../../hooks/useUsers"; // Add new hook
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import {
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";

function Orders() {
  const { orders, error: ordersError } = useOrders();
  const mealIds = useMemo(() => orders.map((order) => order.mealId), [orders]);
  const userIds = useMemo(() => [...new Set(orders.map((order) => order.userId))], [orders]);
  const { meals, loading: mealsLoading, error: mealsError } = useMeals(mealIds);
  const { users, loading: usersLoading, error: usersError } = useUsers(userIds);

  const handleCompleteOrder = async (orderId, currentStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { completed: !currentStatus });
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await deleteDoc(orderRef);
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  if (ordersError) {
    return <Typography color="error" sx={{ p: 3 }}>Error loading orders: {ordersError}</Typography>;
  }
  if (mealsError) {
    return <Typography color="error" sx={{ p: 3 }}>Error loading meals: {mealsError}</Typography>;
  }
  if (usersError) {
    return <Typography color="error" sx={{ p: 3 }}>Error loading users: {usersError}</Typography>;
  }
  if (mealsLoading || usersLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "background.default" }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: "background.default" }}>
      <Typography variant="h4" gutterBottom color="primary">
        All Orders
      </Typography>
      {orders.length === 0 ? (
        <Typography>No orders yet.</Typography>
      ) : (
        orders.map((order) => {
          const meal = meals.find((m) => m.id === order.mealId);
          const user = users.find((u) => u.id === order.userId);
          return (
            <Card
              key={order.id}
              sx={{
                mb: 2,
                bgcolor: order.completed ? "#e0ffe0" : "#ffffff",
                border: order.completed ? "2px solid #0fff50" : "none",
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">
                    {meal?.name || "Loading..."}
                    {order.completed && (
                      <CheckCircleIcon sx={{ color: "#0fff50", ml: 1, verticalAlign: "middle" }} />
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ordered by: {user?.name || "Unknown User"}
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
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={order.completed || false}
                        onChange={() => handleCompleteOrder(order.id, order.completed || false)}
                        sx={{ color: "#ffc523", "&.Mui-checked": { color: "#0fff50" } }}
                      />
                    }
                    label="Completed"
                  />
                  <IconButton onClick={() => handleDeleteOrder(order.id)} sx={{ ml: 1 }}>
                    <DeleteIcon color="text.primary" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          );
        })
      )}
    </Box>
  );
}

export default Orders;