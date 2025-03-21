import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

function MyOrderDetails() {
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
        onClick={() => navigate("/my-orders")}
        sx={{ mb: 2, color: "#0fff50" }}
      >
        Back to My Orders
      </Button>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          bgcolor: order.status === "completed" ? "#e0ffe0" : order.status === "started" ? "#fff0e0" : "#ffffff",
          border: order.status === "completed" ? "2px solid #0fff50" : order.status === "started" ? "2px solid #ffa500" : "none",
        }}
      >
        <Typography variant="h4" gutterBottom color="primary">
          Order Details
        </Typography>
        <Typography variant="h6" color="text.primary">
          Order #{order.id}
          {order.status === "completed" && (
            <CheckCircleIcon sx={{ color: "#0fff50", ml: 1, verticalAlign: "middle" }} />
          )}
          {order.status === "started" && (
            <PlayArrowIcon sx={{ color: "#ffa500", ml: 1, verticalAlign: "middle" }} />
          )}
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
            const condimentQuantities = item.condimentQuantities || {};
            const addOnQuantities = item.addOnQuantities || {};
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
                          Add-Ons: {Object.entries(addOnQuantities)
                            .filter(([_, qty]) => qty > 0)
                            .map(([addOn, qty]) => `${addOn}: ${qty}`)
                            .join(", ") || "None"}
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
                          Add-Ons: {Object.entries(addOnQuantities)
                            .filter(([_, qty]) => qty > 0)
                            .map(([addOn, qty]) => `${addOn}: ${qty}`)
                            .join(", ") || "None"}
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
      </Paper>
    </Box>
  );
}

export default MyOrderDetails;