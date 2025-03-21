import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

function OrderForm({ meal, mealType, condiments, onClose, onAddToBag }) {
  // Validate the meal prop
  if (!meal || !meal.id || !meal.name) {
    return (
      <Dialog open onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ bgcolor: "#2a2e33", color: "#0fff50" }}>
          Error
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "#2a2e33", color: "#ffffff" }}>
          <Typography color="error">
            Invalid meal data. Please select a valid meal.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ bgcolor: "#2a2e33" }}>
          <Button onClick={onClose} sx={{ color: "#ffc523" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  const [quantities, setQuantities] = useState(
    Object.fromEntries((meal.components || []).map((comp) => [comp, 1]))
  );
  const [condimentQuantities, setCondimentQuantities] = useState(
    Object.fromEntries((condiments || []).map((condiment) => [condiment, 0]))
  );
  const [addOnQuantities, setAddOnQuantities] = useState(
    Object.fromEntries((meal.addOns || []).map((addOn) => [addOn, 0]))
  );
  const [notes, setNotes] = useState("");

  const handleQuantityChange = (component, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [component]: Math.max(0, (prev[component] || 0) + delta),
    }));
  };

  const handleCondimentQuantityChange = (condiment, delta) => {
    setCondimentQuantities((prev) => ({
      ...prev,
      [condiment]: Math.max(0, (prev[condiment] || 0) + delta),
    }));
  };

  const handleAddOnQuantityChange = (addOn, delta) => {
    setAddOnQuantities((prev) => ({
      ...prev,
      [addOn]: Math.max(0, (prev[addOn] || 0) + delta),
    }));
  };

  const handleAddToBag = () => {
    const selectedCondiments = Object.entries(condimentQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([condiment, _]) => condiment);
    const selectedAddOns = Object.entries(addOnQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([addOn, _]) => addOn);
    const bagItem = {
      type: "meal",
      mealId: meal.id,
      name: meal.name,
      mealType,
      quantities,
      condiments: selectedCondiments,
      condimentQuantities: condimentQuantities || {},
      addOns: selectedAddOns,
      addOnQuantities: addOnQuantities || {},
      notes,
    };
    onAddToBag(bagItem);
    onClose();
  };

  const totalCondiments = Object.values(condimentQuantities).reduce(
    (sum, qty) => sum + qty,
    0
  );
  const freeCondimentLimit = 1;

  // Check if the order is valid: at least one component should have a quantity greater than 0
  // You can adjust this logic based on your requirements
  const isOrderValid = Object.values(quantities).some((qty) => qty > 0);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ bgcolor: "#2a2e33", color: "#0fff50" }}>
        Customize {meal.name}
      </DialogTitle>
      <DialogContent sx={{ bgcolor: "#2a2e33", color: "#ffffff" }}>
        <Typography variant="h6" gutterBottom color="#0fff50">
          Quantities
        </Typography>
        {meal.components && meal.components.length > 0 ? (
          meal.components.map((component) => (
            <Box
              key={component}
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <Typography sx={{ flexGrow: 1, color: "#ffffff" }}>
                {component}
              </Typography>
              <IconButton
                onClick={() => handleQuantityChange(component, -1)}
                size="small"
                sx={{ color: "#0fff50" }}
              >
                <RemoveIcon />
              </IconButton>
              <Typography sx={{ mx: 1, color: "#ffffff" }}>
                {quantities[component]}
              </Typography>
              <IconButton
                onClick={() => handleQuantityChange(component, 1)}
                size="small"
                sx={{ color: "#0fff50" }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          ))
        ) : (
          <Typography color="#ffffff">No components available.</Typography>
        )}

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }} color="#0fff50">
          Add-Ons
        </Typography>
        <Typography variant="body2" color="#ffffff" sx={{ mb: 2 }}>
          Add-ons may incur an additional charge.
        </Typography>
        <Grid container spacing={2}>
          {meal.addOns && meal.addOns.length > 0 ? (
            meal.addOns.map((addOn) => (
              <Grid item xs={6} sm={4} md={3} key={addOn}>
                <Box
                  sx={{
                    bgcolor: "#ffffff",
                    borderRadius: 1,
                    p: 1,
                    textAlign: "center",
                    border: "1px solid #0fff50",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ mt: 1 }}
                  >
                    {addOn}
                  </Typography>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 1 }}
                  >
                    <IconButton
                      onClick={() => handleAddOnQuantityChange(addOn, -1)}
                      size="small"
                      sx={{ color: "#0fff50" }}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ mx: 1, color: "text.primary" }}>
                      {addOnQuantities[addOn]}
                    </Typography>
                    <IconButton
                      onClick={() => handleAddOnQuantityChange(addOn, 1)}
                      size="small"
                      sx={{ color: "#0fff50" }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
            ))
          ) : (
            <Typography color="#ffffff">No add-ons available.</Typography>
          )}
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }} color="#0fff50">
          Condiments
        </Typography>
        <Typography variant="body2" color="#ffffff" sx={{ mb: 2 }}>
          One free condiment per item
          {totalCondiments > freeCondimentLimit && (
            <Typography component="span" color="#ffc523">
              {" "}
              (Extra condiments may incur a charge)
            </Typography>
          )}
        </Typography>
        <Grid container spacing={2}>
          {condiments && condiments.length > 0 ? (
            condiments.map((condiment) => (
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
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ mt: 1 }}
                  >
                    {condiment}
                  </Typography>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 1 }}
                  >
                    <IconButton
                      onClick={() => handleCondimentQuantityChange(condiment, -1)}
                      size="small"
                      sx={{ color: "#0fff50" }}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ mx: 1, color: "text.primary" }}>
                      {condimentQuantities[condiment]}
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
            ))
          ) : (
            <Typography color="#ffffff">No condiments available.</Typography>
          )}
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }} color="#0fff50">
          Notes
        </Typography>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any special requests..."
          style={{
            width: "100%",
            minHeight: "80px",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #0fff50",
            backgroundColor: "#ffffff",
            color: "#000000",
            resize: "vertical",
          }}
        />
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#2a2e33" }}>
        <Button onClick={onClose} sx={{ color: "#ffc523" }}>
          Cancel
        </Button>
        <Button
          onClick={handleAddToBag}
          variant="contained"
          sx={{ bgcolor: "#0fff50", color: "#000000" }}
          disabled={!isOrderValid} // Only disable if the order is invalid
        >
          Add to Bag
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default OrderForm;