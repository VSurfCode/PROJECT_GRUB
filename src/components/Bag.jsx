import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useBag } from "../context/BagContext";

function Bag({ open, onClose, user }) {
  const { bag, setBag, clearBag } = useBag();
  const [editItem, setEditItem] = useState(null);

  const handleRemoveItem = (index) => {
    setBag((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditItem = (item, index) => {
    setEditItem({ ...item, index });
  };

  const handleQuantityChange = (delta) => {
    setEditItem((prev) => ({
      ...prev,
      quantity: Math.max(1, (prev.quantity || 0) + delta),
    }));
  };

  const handleComponentQuantityChange = (component, delta) => {
    setEditItem((prev) => ({
      ...prev,
      quantities: {
        ...prev.quantities,
        [component]: Math.max(0, (prev.quantities[component] || 0) + delta),
      },
    }));
  };

  const handleCondimentQuantityChange = (condiment, delta) => {
    setEditItem((prev) => {
      const newQuantities = {
        ...prev.condimentQuantities,
        [condiment]: Math.max(0, (prev.condimentQuantities[condiment] || 0) + delta),
      };
      const newCondiments = Object.entries(newQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([condiment, _]) => condiment);
      return {
        ...prev,
        condimentQuantities: newQuantities,
        condiments: newCondiments,
      };
    });
  };

  const handleSaveEdit = () => {
    setBag((prev) => {
      const newBag = [...prev];
      newBag[editItem.index] = {
        ...editItem,
        quantities: editItem.quantities,
        condiments: editItem.condiments,
        condimentQuantities: editItem.condimentQuantities || {}, // Ensure condimentQuantities is always included
      };
      return newBag;
    });
    setEditItem(null);
  };

  const handlePlaceOrder = async () => {
    if (bag.length === 0) return;

    try {
      const itemsWithCookedStatus = bag.map((item) => {
        if (item.type === "meal") {
          const cookedStatus = {};
          Object.keys(item.quantities).forEach((component) => {
            cookedStatus[component] = false;
          });
          return { ...item, cookedStatus };
        } else {
          return { ...item, cookedStatus: false };
        }
      });

      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userName: user.displayName,
        items: itemsWithCookedStatus,
        timestamp: new Date(),
        status: "pending",
      });
      clearBag();
      onClose();
      alert("Order placed successfully!");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order: " + error.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ bgcolor: "#2a2e33", color: "#0fff50" }}>
        Your Bag
      </DialogTitle>
      <DialogContent sx={{ bgcolor: "#2a2e33" }}>
        {bag.length === 0 ? (
          <Typography color="#ffffff">Your bag is empty.</Typography>
        ) : (
          <List>
            {bag.map((item, index) => {
              const condimentQuantities = item.condimentQuantities || {}; // Fallback to empty object
              return (
                <ListItem
                  key={index}
                  sx={{ bgcolor: "#ffffff", mb: 1, borderRadius: 1 }}
                  secondaryAction={
                    <>
                      <IconButton
                        onClick={() => handleEditItem(item, index)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleRemoveItem(index)}>
                        <DeleteIcon color="primary" />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemText
                    primary={item.name}
                    secondary={
                      item.type === "meal"
                        ? `Quantities: ${Object.entries(item.quantities)
                            .map(([comp, qty]) => `${comp}: ${qty}`)
                            .join(", ")} | Condiments: ${
                            Object.entries(condimentQuantities)
                              .filter(([_, qty]) => qty > 0)
                              .map(([condiment, qty]) => `${condiment}: ${qty}`)
                              .join(", ") || "None"
                          }${item.notes ? ` | Notes: ${item.notes}` : ""}`
                        : `Quantity: ${item.quantity} | Condiments: ${
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
        )}
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#2a2e33" }}>
        <Button onClick={onClose} sx={{ color: "#ffc523" }}>
          Close
        </Button>
        <Button
          onClick={handlePlaceOrder}
          variant="contained"
          sx={{ bgcolor: "#0fff50", color: "#000000" }}
          disabled={bag.length === 0}
        >
          Order Now
        </Button>
      </DialogActions>

      {editItem && (
        <Dialog open onClose={() => setEditItem(null)} fullWidth maxWidth="md">
          <DialogTitle sx={{ bgcolor: "#2a2e33", color: "#0fff50" }}>
            Edit {editItem.name}
          </DialogTitle>
          <DialogContent sx={{ bgcolor: "#2a2e33", color: "#ffffff" }}>
            {editItem.type === "meal" ? (
              <>
                <Typography variant="h6" gutterBottom color="#0fff50">
                  Edit Quantities
                </Typography>
                {Object.keys(editItem.quantities).map((component) => (
                  <Box
                    key={component}
                    sx={{ display: "flex", alignItems: "center", mb: 1 }}
                  >
                    <Typography sx={{ flexGrow: 1, color: "#ffffff" }}>
                      {component}
                    </Typography>
                    <IconButton
                      onClick={() => handleComponentQuantityChange(component, -1)}
                      size="small"
                      sx={{ color: "#0fff50" }}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ mx: 1, color: "#ffffff" }}>
                      {editItem.quantities[component]}
                    </Typography>
                    <IconButton
                      onClick={() => handleComponentQuantityChange(component, 1)}
                      size="small"
                      sx={{ color: "#0fff50" }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                ))}
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }} color="#0fff50">
                  Edit Condiments
                </Typography>
                <Grid container spacing={2}>
                  {editItem.condiments.map((condiment) => (
                    <Grid item xs={6} sm={4} md={3} key={condiment}>
                      <Box
                        sx={{
                          bgcolor: "#ffffff",
                          borderRadius: 1,
                          p: 1,
                          textAlign: "center",
                          border: "1px solid #0fff50",
                        }}
                      >
                        <img
                          src="https://via.placeholder.com/50"
                          alt={condiment}
                          style={{ width: "50px", height: "50px", objectFit: "cover" }}
                        />
                        <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                          {condiment}
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                          <IconButton
                            onClick={() => handleCondimentQuantityChange(condiment, -1)}
                            size="small"
                            sx={{ color: "#0fff50" }}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography sx={{ mx: 1, color: "text.primary" }}>
                            {editItem.condimentQuantities[condiment] || 0}
                          </Typography>
                          <IconButton
                            onClick={() => handleCondimentQuantityChange(condiment, 1)}
                            size="small"
                            sx={{ color: "#0fff50" }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography sx={{ flexGrow: 1, color: "#ffffff" }}>
                    Quantity
                  </Typography>
                  <IconButton
                    onClick={() => handleQuantityChange(-1)}
                    size="small"
                    sx={{ color: "#0fff50" }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography sx={{ mx: 1, color: "#ffffff" }}>
                    {editItem.quantity}
                  </Typography>
                  <IconButton
                    onClick={() => handleQuantityChange(1)}
                    size="small"
                    sx={{ color: "#0fff50" }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }} color="#0fff50">
                  Edit Condiments
                </Typography>
                <Grid container spacing={2}>
                  {editItem.condiments.map((condiment) => (
                    <Grid item xs={6} sm={4} md={3} key={condiment}>
                      <Box
                        sx={{
                          bgcolor: "#ffffff",
                          borderRadius: 1,
                          p: 1,
                          textAlign: "center",
                          border: "1px solid #0fff50",
                        }}
                      >
                        <img
                          src="https://via.placeholder.com/50"
                          alt={condiment}
                          style={{ width: "50px", height: "50px", objectFit: "cover" }}
                        />
                        <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                          {condiment}
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                          <IconButton
                            onClick={() => handleCondimentQuantityChange(condiment, -1)}
                            size="small"
                            sx={{ color: "#0fff50" }}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography sx={{ mx: 1, color: "text.primary" }}>
                            {editItem.condimentQuantities[condiment] || 0}
                          </Typography>
                          <IconButton
                            onClick={() => handleCondimentQuantityChange(condiment, 1)}
                            size="small"
                            sx={{ color: "#0fff50" }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ bgcolor: "#2a2e33" }}>
            <Button onClick={() => setEditItem(null)} sx={{ color: "#ffc523" }}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              variant="contained"
              sx={{ bgcolor: "#0fff50", color: "#000000" }}
              disabled={
                editItem.type === "meal" &&
                Object.values(editItem.quantities).some((qty) => qty === 0)
              }
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Dialog>
  );
}

export default Bag;