import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  FormControlLabel,
  Checkbox,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          setOrder({ id: orderSnap.id, ...orderSnap.data() });
        } else {
          setError("Order not found.");
        }
      } catch (err) {
        setError("Error fetching order: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleCookedChange = async (itemIndex, component = null) => {
    const updatedItems = [...order.items];
    const item = updatedItems[itemIndex];

    if (item.type === "meal") {
      const updatedCookedStatus = {
        ...item.cookedStatus,
        [component]: !item.cookedStatus[component],
      };
      updatedItems[itemIndex] = { ...item, cookedStatus: updatedCookedStatus };
    } else {
      updatedItems[itemIndex] = { ...item, cookedStatus: !item.cookedStatus };
    }

    const allCooked = updatedItems.every((item) => {
      if (item.type === "meal") {
        return Object.values(item.cookedStatus).every((status) => status);
      }
      return item.cookedStatus;
    });

    const updatedStatus = allCooked ? "completed" : "pending";

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        items: updatedItems,
        status: updatedStatus,
      });
      setOrder((prev) => ({
        ...prev,
        items: updatedItems,
        status: updatedStatus,
      }));
    } catch (err) {
      setError("Error updating order: " + err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "background.default" }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error" sx={{ p: 3 }}>{error}</Typography>;
  }

  return (
    <Box sx={{ p: 3, bgcolor: "background.default" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/admin/orders")}
        sx={{ mb: 2, color: "#0fff50" }}
      >
        Back to Orders
      </Button>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          bgcolor: order.status === "completed" ? "#e0ffe0" : "#ffffff",
          border: order.status === "completed" ? "2px solid #0fff50" : "none",
        }}
      >
        <Typography variant="h4" gutterBottom color="primary">
          Order Details
        </Typography>
        <Typography variant="h6" color="text.primary">
          Ordered by: {order.userName || "Unknown User"}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Time: {order.timestamp?.toDate().toLocaleString() || "N/A"}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Typography>
        <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
          Items:
        </Typography>
        <List>
          {order.items.map((item, itemIndex) => {
            const condimentQuantities = item.condimentQuantities || {}; // Fallback to empty object
            return (
              <ListItem
                key={itemIndex}
                sx={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  bgcolor: "#2a2e33",
                  mb: 1,
                  borderRadius: 1,
                  border: "1px solid #0fff50",
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="h6" color="#0fff50">
                      {item.name}
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
                        <Box sx={{ mt: 1 }}>
                          {Object.keys(item.cookedStatus).map((component) => (
                            <FormControlLabel
                              key={component}
                              control={
                                <Checkbox
                                  checked={item.cookedStatus[component]}
                                  onChange={() => handleCookedChange(itemIndex, component)}
                                  sx={{ color: "#ffc523", "&.Mui-checked": { color: "#0fff50" } }}
                                />
                              }
                              label={`Cooked ${component}`}
                              sx={{ color: "#ffffff" }}
                            />
                          ))}
                        </Box>
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
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={item.cookedStatus}
                              onChange={() => handleCookedChange(itemIndex)}
                              sx={{ color: "#ffc523", "&.Mui-checked": { color: "#0fff50" } }}
                            />
                          }
                          label="Cooked"
                          sx={{ color: "#ffffff" }}
                        />
                      </>
                    )
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
}

export default OrderDetails;