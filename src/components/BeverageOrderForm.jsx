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

function BeverageOrderForm({ beverage, condiments, onClose, onAddToBag }) {
  const [quantity, setQuantity] = useState(1);
  const [condimentQuantities, setCondimentQuantities] = useState(
    Object.fromEntries(
      (condiments || []).map((condiment) => [condiment, 0])
    )
  );

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleCondimentQuantityChange = (condiment, delta) => {
    setCondimentQuantities((prev) => ({
      ...prev,
      [condiment]: Math.max(0, (prev[condiment] || 0) + delta),
    }));
  };

  const handleAddToBag = () => {
    const selectedCondiments = Object.entries(condimentQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([condiment, _]) => condiment);
    const bagItem = {
      type: "beverage",
      mealId: beverage.id,
      name: beverage.name,
      quantity,
      condiments: selectedCondiments,
      condimentQuantities: condimentQuantities || {},
    };
    onAddToBag(bagItem);
    onClose();
  };

  const totalCondiments = Object.values(condimentQuantities).reduce(
    (sum, qty) => sum + qty,
    0
  );
  const freeCondimentLimit = 1;

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ bgcolor: "#2a2e33", color: "#0fff50" }}>
        Customize {beverage.name}
      </DialogTitle>
      <DialogContent sx={{ bgcolor: "#2a2e33", color: "#ffffff" }}>
        <Typography variant="h6" gutterBottom color="#0fff50">
          Quantity
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton
            onClick={() => handleQuantityChange(-1)}
            size="small"
            sx={{ color: "#0fff50" }}
          >
            <RemoveIcon />
          </IconButton>
          <Typography sx={{ mx: 1, color: "#ffffff" }}>{quantity}</Typography>
          <IconButton
            onClick={() => handleQuantityChange(1)}
            size="small"
            sx={{ color: "#0fff50" }}
          >
            <AddIcon />
          </IconButton>
        </Box>

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
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#2a2e33" }}>
        <Button onClick={onClose} sx={{ color: "#ffc523" }}>
          Cancel
        </Button>
        <Button
          onClick={handleAddToBag}
          variant="contained"
          sx={{ bgcolor: "#0fff50", color: "#000000" }}
        >
          Add to Bag
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BeverageOrderForm;