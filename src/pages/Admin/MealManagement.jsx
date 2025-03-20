import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, storage } from "../../firebase"; // Import storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Add Storage functions
import {
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Input,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

function MealManagement() {
  const [meals, setMeals] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null); // Store the image file
  const [imageUrl, setImageUrl] = useState(""); // Store the URL after upload
  const [addOns, setAddOns] = useState("");
  const [error, setError] = useState(""); // Add error state

  useEffect(() => {
    const fetchMeals = async () => {
      const mealsCollection = collection(db, "meals");
      const mealsSnapshot = await getDocs(mealsCollection);
      const mealsList = mealsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMeals(mealsList);
    };
    fetchMeals();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (optional)
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file (e.g., PNG, JPEG).");
        setImageFile(null);
        return;
      }
      setError("");
      setImageFile(file);
      // Preview the image (optional)
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    setError("");
    try {
      let finalImageUrl = "";

      // If an image file is selected, upload it to Firebase Storage
      if (imageFile) {
        const storageRef = ref(storage, `meals/${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(storageRef);
      }

      // Add the meal to Firestore with the image URL
      await addDoc(collection(db, "meals"), {
        name,
        description,
        imageUrl: finalImageUrl,
        addOns: addOns.split(",").map((addOn) => addOn.trim()),
      });

      // Reset form
      setName("");
      setDescription("");
      setImageFile(null);
      setImageUrl("");
      setAddOns("");

      // Refresh meals list
      const mealsCollection = collection(db, "meals");
      const mealsSnapshot = await getDocs(mealsCollection);
      const mealsList = mealsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMeals(mealsList);
    } catch (error) {
      console.error("Error adding meal:", error);
      setError("Failed to add meal: " + error.message);
    }
  };

  const handleDeleteMeal = async (id) => {
    await deleteDoc(doc(db, "meals", id));
    setMeals(meals.filter((meal) => meal.id !== id));
  };

  return (
    <Box sx={{ px: 3, bgcolor: "background.default" }}>
      <Typography variant="h4" gutterBottom color="primary">
        Manage Meals
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 3, border: "3px solid #ffc523" }}>
        <Box component="form" onSubmit={handleAddMeal}>
          <TextField
            fullWidth
            label="Meal Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            margin="normal"
            variant="outlined"
            sx={{ bgcolor: "#fff" }}
          />
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            variant="outlined"
            sx={{ bgcolor: "#fff" }}
          />
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body1" color="primary">
              Upload Image
            </Typography>
            <Input
              type="file"
              onChange={handleImageChange}
              inputProps={{ accept: "image/*" }}
              sx={{ mt: 1 }}
            />
            {imageUrl && (
              <Box sx={{ mt: 2 }}>
                <img src={imageUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: "200px" }} />
              </Box>
            )}
          </Box>
          <TextField
            fullWidth
            label="Add-ons (comma-separated)"
            value={addOns}
            onChange={(e) => setAddOns(e.target.value)}
            margin="normal"
            variant="outlined"
            sx={{ bgcolor: "#fff" }}
          />
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2, py: 1.5 }}
          >
            Add Meal
          </Button>
        </Box>
      </Paper>
      <Typography variant="h5" gutterBottom color="primary">
        Current Meals
      </Typography>
      <List>
        {meals.map((meal) => (
          <ListItem
            key={meal.id}
            secondaryAction={
              <IconButton edge="end" onClick={() => handleDeleteMeal(meal.id)}>
                <DeleteIcon color="secondary" />
              </IconButton>
            }
            sx={{ bgcolor: "#fff", mb: 1, borderRadius: 1 }}
          >
            <ListItemText
              primary={meal.name}
              secondary={meal.description || "No description"}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default MealManagement;