import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";

function OrderForm({ meal, mealType, onClose }) {
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false); // State for success message
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        mealId: meal.id,
        mealType,
        addOns: selectedAddOns,
        timestamp: serverTimestamp(),
        completed: false, // Add completed field
      });
      setOpenSnackbar(true); // Show success message
      setTimeout(() => onClose(), 1500); // Close dialog after 1.5 seconds
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  const toggleAddOn = (addOn) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOn) ? prev.filter((a) => a !== addOn) : [...prev, addOn]
    );
  };

  return (
    <>
      <Dialog open={true} onClose={onClose}>
        <DialogTitle sx={{ bgcolor: "#0fff50", color: "#000" }}>
          Order {meal.name}!
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "#ffffff" }}>
          <Typography color="primary" sx={{ mt: 2 }}>
            Add some extras:
          </Typography>
          {meal.addOns && meal.addOns.length > 0 ? (
            meal.addOns.map((addOn) => (
              <FormControlLabel
                key={addOn}
                control={
                  <Checkbox
                    checked={selectedAddOns.includes(addOn)}
                    onChange={() => toggleAddOn(addOn)}
                    sx={{ color: "#ffc523", "&.Mui-checked": { color: "#0fff50" } }}
                  />
                }
                label={addOn}
              />
            ))
          ) : (
            <Typography color="text.secondary">No extras available!</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: "#ffffff" }}>
          <Button onClick={onClose} color="secondary">
            Nope
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Order It!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={1500}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ bgcolor: "#0fff50", color: "#000" }}>
          Order placed successfully! Yum!
        </Alert>
      </Snackbar>
    </>
  );
}

export default OrderForm;