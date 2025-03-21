import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useOrders from "../../hooks/useOrders";
import useMeals from "../../hooks/useMeals";
import useUsers from "../../hooks/useUsers";
import { doc, updateDoc, deleteDoc, addDoc, collection } from "firebase/firestore";
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
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

function Orders() {
  const { orders, error: ordersError } = useOrders();
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

  const userIds = useMemo(() => [...new Set(orders.map((order) => order.userId))], [orders]);

  const { meals, loading: mealsLoading, error: mealsError } = useMeals(mealIds);
  const { users, loading: usersLoading, error: usersError } = useUsers(userIds);

  const handleStartOrder = async (orderId, userId) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: "started" });

      await addDoc(collection(db, "notifications"), {
        userId: userId,
        message: "Your order has been started!",
        timestamp: new Date(),
        read: false,
      });
    } catch (error) {
      console.error("Error starting order:", error);
    }
  };

  const handleCompleteOrder = async (orderId, userId, currentStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const newStatus = currentStatus === "pending" || currentStatus === "started" ? "completed" : "pending";
      await updateDoc(orderRef, { status: newStatus });

      if (newStatus === "completed") {
        await addDoc(collection(db, "notifications"), {
          userId: userId,
          message: "Your order is completed and ready for pickup!",
          timestamp: new Date(),
          read: false,
        });
      }
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
          const user = users.find((u) => u.id === order.userId);
          return (
            <Card
              key={order.id}
              sx={{
                mb: 2,
                bgcolor: order.status === "completed" ? "#e0ffe0" : order.status === "started" ? "#fff0e0" : "#ffffff",
                border: order.status === "completed" ? "2px solid #0fff50" : order.status === "started" ? "2px solid #ffa500" : "none",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/admin/orders/${order.id}`)}
            >
              <CardContent sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">
                    Order by {user?.name || "Unknown User"}
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
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {order.status === "pending" && (
                    <Button
                      variant="contained"
                      color="warning"
                      startIcon={<PlayArrowIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartOrder(order.id, order.userId);
                      }}
                      sx={{ mr: 1 }}
                    >
                      Start Order
                    </Button>
                  )}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={order.status === "completed"}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleCompleteOrder(order.id, order.userId, order.status);
                        }}
                        sx={{ color: "#ffc523", "&.Mui-checked": { color: "#0fff50" } }}
                      />
                    }
                    label="Completed"
                  />
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOrder(order.id);
                    }}
                    sx={{ ml: 1 }}
                  >
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