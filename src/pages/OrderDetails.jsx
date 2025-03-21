import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, addDoc, collection } from "firebase/firestore";
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
          const orderData = { id: orderSnap.id, ...orderSnap.data() };
          const updatedItems = orderData.items.map((item) => {
            if (!item.cookedAddOns) {
              const cookedAddOns = Object.fromEntries(
                (item.addOns || []).map((addOn) => [addOn, false])
              );
              return { ...item, cookedAddOns };
            }
            return item;
          });
          setOrder({ ...orderData, items: updatedItems });
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

    if (item.type === "meal" && component) {
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
        const componentsCooked = Object.values(item.cookedStatus).every(
          (status) => status
        );
        const addOnsCooked = Object.values(item.cookedAddOns || {}).every(
          (status) => status
        );
        return componentsCooked && addOnsCooked;
      }
      const addOnsCooked = Object.values(item.cookedAddOns || {}).every(
        (status) => status
      );
      return item.cookedStatus && addOnsCooked;
    });

    const updatedStatus = allCooked ? "completed" : order.status === "pending" ? "pending" : "started";

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        items: updatedItems,
        status: updatedStatus,
      });

      if (updatedStatus === "completed" && order.status !== "completed") {
        await addDoc(collection(db, "notifications"), {
          userId: order.userId,
          message: "Your order is completed and ready for pickup!",
          timestamp: new Date(),
          read: false,
        });
      }

      setOrder((prev) => ({
        ...prev,
        items: updatedItems,
        status: updatedStatus,
      }));
    } catch (err) {
      setError("Error updating order: " + err.message);
    }
  };

  const handleAddOnCookedChange = async (itemIndex, addOn) => {
    const updatedItems = [...order.items];
    const item = updatedItems[itemIndex];

    const updatedCookedAddOns = {
      ...item.cookedAddOns,
      [addOn]: !item.cookedAddOns[addOn],
    };
    updatedItems[itemIndex] = { ...item, cookedAddOns: updatedCookedAddOns };

    const allCooked = updatedItems.every((item) => {
      if (item.type === "meal") {
        const componentsCooked = Object.values(item.cookedStatus).every(
          (status) => status
        );
        const addOnsCooked = Object.values(item.cookedAddOns || {}).every(
          (status) => status
        );
        return componentsCooked && addOnsCooked;
      }
      const addOnsCooked = Object.values(item.cookedAddOns || {}).every(
        (status) => status
      );
      return item.cookedStatus && addOnsCooked;
    });

    const updatedStatus = allCooked ? "completed" : order.status === "pending" ? "pending" : "started";

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        items: updatedItems,
        status: updatedStatus,
      });

      if (updatedStatus === "completed" && order.status !== "completed") {
        await addDoc(collection(db, "notifications"), {
          userId: order.userId,
          message: "Your order is completed and ready for pickup!",
          timestamp: new Date(),
          read: false,
        });
      }

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
          bgcolor: order.status === "completed" ? "#e0ffe0" : order.status === "started" ? "#fff0e0" : "#ffffff",
          border: order.status === "completed" ? "2px solid #0fff50" : order.status === "started" ? "2px solid #ffa500" : "none",
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
                        {Object.entries(addOnQuantities).filter(([_, qty]) => qty > 0).length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {Object.entries(addOnQuantities)
                              .filter(([_, qty]) => qty > 0)
                              .map(([addOn, qty]) => (
                                <FormControlLabel
                                  key={addOn}
                                  control={
                                    <Checkbox
                                      checked={item.cookedAddOns[addOn] || false}
                                      onChange={() => handleAddOnCookedChange(itemIndex, addOn)}
                                      sx={{ color: "#ffc523", "&.Mui-checked": { color: "#0fff50" } }}
                                    />
                                  }
                                  label={`Prepared ${addOn} (${qty})`}
                                  sx={{ color: "#ffffff" }}
                                />
                              ))}
                          </Box>
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
                        {Object.entries(addOnQuantities).filter(([_, qty]) => qty > 0).length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {Object.entries(addOnQuantities)
                              .filter(([_, qty]) => qty > 0)
                              .map(([addOn, qty]) => (
                                <FormControlLabel
                                  key={addOn}
                                  control={
                                    <Checkbox
                                      checked={item.cookedAddOns[addOn] || false}
                                      onChange={() => handleAddOnCookedChange(itemIndex, addOn)}
                                      sx={{ color: "#ffc523", "&.Mui-checked": { color: "#0fff50" } }}
                                    />
                                  }
                                  label={`Prepared ${addOn} (${qty})`}
                                  sx={{ color: "#ffffff" }}
                                />
                              ))}
                          </Box>
                        )}
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