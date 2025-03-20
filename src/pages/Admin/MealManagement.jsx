import { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot, collection, addDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Storage functions
import { db, storage } from "../../firebase"; // Import storage from your firebase config
import {
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

function MealManagement() {
  const [meals, setMeals] = useState([]);
  const [menu, setMenu] = useState({ breakfast: [], lunch: [], dinner: [] });
  const [newMeal, setNewMeal] = useState({ name: "", description: "", addOns: "", image: null });
  const [loading, setLoading] = useState(false);

  // Fetch meals and current menu
  useEffect(() => {
    const mealsUnsub = onSnapshot(collection(db, "meals"), (snapshot) => {
      setMeals(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    const menuUnsub = onSnapshot(doc(db, "currentMenu", "today"), (docSnap) => {
      const data = docSnap.exists() ? docSnap.data() : { breakfast: [], lunch: [], dinner: [] };
      setMenu(data);
    });
    return () => {
      mealsUnsub();
      menuUnsub();
    };
  }, []);

  // Add a new meal with image
  const handleAddMeal = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = "";
      if (newMeal.image) {
        // Upload image to Firebase Storage
        const storageRef = ref(storage, `meals/${newMeal.image.name}-${Date.now()}`);
        await uploadBytes(storageRef, newMeal.image);
        imageUrl = await getDownloadURL(storageRef);
      }

      // Add meal to Firestore with image URL
      await addDoc(collection(db, "meals"), {
        name: newMeal.name,
        description: newMeal.description,
        addOns: newMeal.addOns.split(",").map((item) => item.trim()).filter(Boolean),
        imageUrl, // Store the image URL
      });

      // Reset form
      setNewMeal({ name: "", description: "", addOns: "", image: null });
    } catch (error) {
      console.error("Error adding meal:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a meal
  const handleDeleteMeal = async (mealId) => {
    await deleteDoc(doc(db, "meals", mealId));
  };

  // Update the current menu
  const updateMenu = async (mealType, mealId) => {
    const updated = {
      ...menu,
      [mealType]: menu[mealType].includes(mealId)
        ? menu[mealType].filter((id) => id !== mealId)
        : [...menu[mealType], mealId],
    };
    setMenu(updated);
    await setDoc(doc(db, "currentMenu", "today"), updated);
  };

  return (
    <Box sx={{ p: 3, bgcolor: "background.default", maxWidth: "500px", display: 'flex', flexDirection: 'column', margin: '0 auto', mt: 5}}>
      <Typography variant="h4" gutterBottom color="text.primary">
        Meal Management
      </Typography>

      {/* Add New Meal Form */}
      <Box component="form" onSubmit={handleAddMeal} sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom color="text.primary">
          Add a New Meal
        </Typography>
        <TextField
          fullWidth
          label="Meal Name"
          value={newMeal.name}
          onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
          required
          margin="normal"
          sx={{ bgcolor: "#fff" }}
        />
        <TextField
          fullWidth
          label="Description"
          value={newMeal.description}
          onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
          margin="normal"
          sx={{ bgcolor: "#fff" }}
        />
        <TextField
          fullWidth
          label="Add-ons (comma-separated)"
          value={newMeal.addOns}
          onChange={(e) => setNewMeal({ ...newMeal, addOns: e.target.value })}
          margin="normal"
          sx={{ bgcolor: "#fff" }}
        />
        <Box sx={{ mt: 2, mb: 2 }}>
          <Button
            variant="contained"
            component="label"
            color="secondary"
            sx={{ mr: 2 }}
          >
            Upload Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setNewMeal({ ...newMeal, image: e.target.files[0] })}
            />
          </Button>
          {newMeal.image && (
            <Typography variant="body2" color="text.primary">
              Selected: {newMeal.image.name}
            </Typography>
          )}
        </Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 1 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Add Meal"}
        </Button>
      </Box>

      {/* List of Meals */}
      <Typography variant="h5" gutterBottom color="primary">
        Current Meals
      </Typography>
      <List>
        {meals.map((meal) => (
          <ListItem key={meal.id} sx={{ bgcolor: "#ffffff", mb: 1, borderRadius: "10px" }}>
            <ListItemText
              primary={meal.name}
              secondary={meal.description}
              primaryTypographyProps={{ color: "primary" }}
              secondaryTypographyProps={{ color: "text.secondary" }}
            />
            {meal.imageUrl && (
              <Box sx={{ mr: 2 }}>
                <img src={meal.imageUrl} alt={meal.name} style={{ width: 50, height: 50, borderRadius: "5px" }} />
              </Box>
            )}
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleDeleteMeal(meal.id)}>
                <DeleteIcon color="secondary" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {/* Menu Management */}
      <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
        Today’s Menu
      </Typography>
      {["breakfast", "lunch", "dinner"].map((type) => (
        <Box key={type} sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Typography>
          {meals.map((meal) => (
            <FormControlLabel
              key={meal.id}
              control={
                <Checkbox
                  checked={menu[type].includes(meal.id)}
                  onChange={() => updateMenu(type, meal.id)}
                  sx={{ color: "#ffc523", "&.Mui-checked": { color: "#0fff50" } }}
                />
              }
              label={meal.name}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}

export default MealManagement;