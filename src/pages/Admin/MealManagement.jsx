import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  runTransaction,
} from "firebase/firestore";
import { db, storage } from "../../firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  InputAdornment,
  Tabs,
  Tab,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

function MealManagement() {
  const [meals, setMeals] = useState([]);
  const [condiments, setCondiments] = useState([]);
  const [tabValue, setTabValue] = useState(0); // 0: Meals, 1: Condiments
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [mealType, setMealType] = useState("");
  const [category, setCategory] = useState("meal"); // New state for category
  const [componentInput, setComponentInput] = useState(""); // Input for components
  const [components, setComponents] = useState([]); // Array of components
  const [addOnInput, setAddOnInput] = useState("");
  const [addOns, setAddOns] = useState([]);
  const [condimentInput, setCondimentInput] = useState(""); // Input for condiments
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // State for editing meals
  const [editMeal, setEditMeal] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editMealType, setEditMealType] = useState("");
  const [editCategory, setEditCategory] = useState("meal");
  const [editComponentInput, setEditComponentInput] = useState("");
  const [editComponents, setEditComponents] = useState([]);
  const [editAddOnInput, setEditAddOnInput] = useState("");
  const [editAddOns, setEditAddOns] = useState([]);

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState(null);

  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      try {
        const mealsCollection = collection(db, "meals");
        const mealsSnapshot = await getDocs(mealsCollection);
        const mealsList = mealsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMeals(mealsList);
      } catch (err) {
        setError("Failed to fetch meals: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchCondiments = async () => {
      try {
        const condimentDoc = await getDoc(doc(db, "condiments", "condiments"));
        if (condimentDoc.exists()) {
          setCondiments(condimentDoc.data().items || []);
        }
      } catch (err) {
        setError("Failed to fetch condiments: " + err.message);
      }
    };

    fetchMeals();
    fetchCondiments();
  }, []);

  const handleImageChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file (e.g., PNG, JPEG).");
        if (isEdit) {
          setEditImageFile(null);
          setEditImageUrl("");
        } else {
          setImageFile(null);
          setImageUrl("");
        }
        return;
      }
      setError("");
      if (isEdit) {
        setEditImageFile(file);
        setEditImageUrl(URL.createObjectURL(file));
      } else {
        setImageFile(file);
        setImageUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleComponentKeyPress = (e, isEdit = false) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const newComponent = e.target.value.trim();
      if (isEdit) {
        if (!editComponents.includes(newComponent)) {
          setEditComponents([...editComponents, newComponent]);
        }
        setEditComponentInput("");
      } else {
        if (!components.includes(newComponent)) {
          setComponents([...components, newComponent]);
        }
        setComponentInput("");
      }
      e.preventDefault();
    }
  };

  const handleComponentButtonClick = (isEdit = false) => {
    if (isEdit && editComponentInput.trim()) {
      if (!editComponents.includes(editComponentInput.trim())) {
        setEditComponents([...editComponents, editComponentInput.trim()]);
      }
      setEditComponentInput("");
    } else if (!isEdit && componentInput.trim()) {
      if (!components.includes(componentInput.trim())) {
        setComponents([...components, componentInput.trim()]);
      }
      setComponentInput("");
    }
  };

  const handleDeleteComponent = (componentToDelete, isEdit = false) => {
    if (isEdit) {
      setEditComponents(editComponents.filter((comp) => comp !== componentToDelete));
    } else {
      setComponents(components.filter((comp) => comp !== componentToDelete));
    }
  };

  const handleAddOnKeyPress = (e, isEdit = false) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const newAddOn = e.target.value.trim();
      if (isEdit) {
        if (!editAddOns.includes(newAddOn)) {
          setEditAddOns([...editAddOns, newAddOn]);
        }
        setEditAddOnInput("");
      } else {
        if (!addOns.includes(newAddOn)) {
          setAddOns([...addOns, newAddOn]);
        }
        setAddOnInput("");
      }
      e.preventDefault();
    }
  };

  const handleAddOnButtonClick = (isEdit = false) => {
    if (isEdit && editAddOnInput.trim()) {
      if (!editAddOns.includes(editAddOnInput.trim())) {
        setEditAddOns([...editAddOns, editAddOnInput.trim()]);
      }
      setEditAddOnInput("");
    } else if (!isEdit && addOnInput.trim()) {
      if (!addOns.includes(addOnInput.trim())) {
        setAddOns([...addOns, addOnInput.trim()]);
      }
      setAddOnInput("");
    }
  };

  const handleDeleteAddOn = (addOnToDelete, isEdit = false) => {
    if (isEdit) {
      setEditAddOns(editAddOns.filter((addOn) => addOn !== addOnToDelete));
    } else {
      setAddOns(addOns.filter((addOn) => addOn !== addOnToDelete));
    }
  };

  const handleCondimentKeyPress = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const newCondiment = e.target.value.trim();
      if (!condiments.includes(newCondiment)) {
        const updatedCondiments = [...condiments, newCondiment];
        setCondiments(updatedCondiments);
        setDoc(doc(db, "condiments", "condiments"), { items: updatedCondiments });
      }
      setCondimentInput("");
      e.preventDefault();
    }
  };

  const handleCondimentButtonClick = () => {
    if (condimentInput.trim()) {
      const newCondiment = condimentInput.trim();
      if (!condiments.includes(newCondiment)) {
        const updatedCondiments = [...condiments, newCondiment];
        setCondiments(updatedCondiments);
        setDoc(doc(db, "condiments", "condiments"), { items: updatedCondiments });
      }
      setCondimentInput("");
    }
  };

  const handleDeleteCondiment = (condimentToDelete) => {
    const updatedCondiments = condiments.filter((condiment) => condiment !== condimentToDelete);
    setCondiments(updatedCondiments);
    setDoc(doc(db, "condiments", "condiments"), { items: updatedCondiments });
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!mealType) {
      setError("Please select a meal type (Breakfast, Lunch, or Dinner).");
      setLoading(false);
      return;
    }

    try {
      let finalImageUrl = "";
      if (imageFile) {
        const storageRef = ref(storage, `meals/${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(storageRef);
      }

      const newMealRef = await addDoc(collection(db, "meals"), {
        name,
        description,
        imageUrl: finalImageUrl,
        addOns,
        category,
        components: category === "meal" ? components : [], // Only add components for meals
      });

      const menuRef = doc(db, "currentMenu", "today");
      await runTransaction(db, async (transaction) => {
        const menuDoc = await transaction.get(menuRef);
        let menuData = menuDoc.exists()
          ? menuDoc.data()
          : { breakfast: [], lunch: [], dinner: [], beverages: [] };

        const updatedMenu = { ...menuData };
        const mealTypeKey = category === "beverage" ? "beverages" : mealType;
        if (!updatedMenu[mealTypeKey]) {
          updatedMenu[mealTypeKey] = [];
        }
        updatedMenu[mealTypeKey] = [...updatedMenu[mealTypeKey], newMealRef.id];

        transaction.set(menuRef, updatedMenu);
      });

      setName("");
      setDescription("");
      setImageFile(null);
      setImageUrl("");
      setMealType("");
      setCategory("meal");
      setComponents([]);
      setComponentInput("");
      setAddOns([]);
      setAddOnInput("");
      setSuccess("Item added successfully and added to the menu!");

      const mealsCollection = collection(db, "meals");
      const mealsSnapshot = await getDocs(mealsCollection);
      const mealsList = mealsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMeals(mealsList);
    } catch (error) {
      setError("Failed to add item: " + error.message);
      console.error("Error in handleAddMeal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMeal = (meal) => {
    setEditMeal(meal);
    setEditName(meal.name);
    setEditDescription(meal.description || "");
    setEditImageUrl(meal.imageUrl || "");
    setEditAddOns(meal.addOns || []);
    setEditAddOnInput("");
    setEditCategory(meal.category || "meal");
    setEditComponents(meal.components || []);
    setEditComponentInput("");
    const menuRef = doc(db, "currentMenu", "today");
    getDoc(menuRef).then((docSnap) => {
      if (docSnap.exists()) {
        const menuData = docSnap.data();
        if (menuData.breakfast?.includes(meal.id)) {
          setEditMealType("breakfast");
        } else if (menuData.lunch?.includes(meal.id)) {
          setEditMealType("lunch");
        } else if (menuData.dinner?.includes(meal.id)) {
          setEditMealType("dinner");
        } else if (menuData.beverages?.includes(meal.id)) {
          setEditMealType("beverages");
        } else {
          setEditMealType("");
        }
      }
    });
  };

  const handleUpdateMeal = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      let finalImageUrl = editImageUrl;
      if (editImageFile) {
        if (editMeal.imageUrl) {
          const oldImageRef = ref(storage, editMeal.imageUrl);
          await deleteObject(oldImageRef).catch((err) =>
            console.error("Error deleting old image:", err)
          );
        }
        const storageRef = ref(storage, `meals/${editImageFile.name}`);
        await uploadBytes(storageRef, editImageFile);
        finalImageUrl = await getDownloadURL(storageRef);
      }

      const mealRef = doc(db, "meals", editMeal.id);
      await updateDoc(mealRef, {
        name: editName,
        description: editDescription,
        imageUrl: finalImageUrl,
        addOns: editAddOns,
        category: editCategory,
        components: editCategory === "meal" ? editComponents : [],
      });

      const menuRef = doc(db, "currentMenu", "today");
      await runTransaction(db, async (transaction) => {
        const menuDoc = await transaction.get(menuRef);
        let menuData = menuDoc.exists()
          ? menuDoc.data()
          : { breakfast: [], lunch: [], dinner: [], beverages: [] };

        const updatedMenu = {
          breakfast: menuData.breakfast
            ? menuData.breakfast.filter((id) => id !== editMeal.id)
            : [],
          lunch: menuData.lunch
            ? menuData.lunch.filter((id) => id !== editMeal.id)
            : [],
          dinner: menuData.dinner
            ? menuData.dinner.filter((id) => id !== editMeal.id)
            : [],
          beverages: menuData.beverages
            ? menuData.beverages.filter((id) => id !== editMeal.id)
            : [],
        };

        if (editMealType) {
          const mealTypeKey = editCategory === "beverage" ? "beverages" : editMealType;
          if (!updatedMenu[mealTypeKey]) {
            updatedMenu[mealTypeKey] = [];
          }
          updatedMenu[mealTypeKey] = [...updatedMenu[mealTypeKey], editMeal.id];
        }

        transaction.set(menuRef, updatedMenu);
      });

      setEditMeal(null);
      setEditName("");
      setEditDescription("");
      setEditImageFile(null);
      setEditImageUrl("");
      setEditMealType("");
      setEditCategory("meal");
      setEditComponents([]);
      setEditComponentInput("");
      setEditAddOns([]);
      setEditAddOnInput("");
      setSuccess("Item updated successfully!");

      const mealsCollection = collection(db, "meals");
      const mealsSnapshot = await getDocs(mealsCollection);
      const mealsList = mealsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMeals(mealsList);
    } catch (error) {
      setError("Failed to update item: " + error.message);
      console.error("Error in handleUpdateMeal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mealToDelete.imageUrl) {
        const imageRef = ref(storage, mealToDelete.imageUrl);
        await deleteObject(imageRef).catch((err) =>
          console.error("Error deleting image:", err)
        );
      }

      await deleteDoc(doc(db, "meals", mealToDelete.id));

      const menuRef = doc(db, "currentMenu", "today");
      await runTransaction(db, async (transaction) => {
        const menuDoc = await transaction.get(menuRef);
        let menuData = menuDoc.exists()
          ? menuDoc.data()
          : { breakfast: [], lunch: [], dinner: [], beverages: [] };

        const updatedMenu = {
          breakfast: menuData.breakfast
            ? menuData.breakfast.filter((id) => id !== mealToDelete.id)
            : [],
          lunch: menuData.lunch
            ? menuData.lunch.filter((id) => id !== mealToDelete.id)
            : [],
          dinner: menuData.dinner
            ? menuData.dinner.filter((id) => id !== mealToDelete.id)
            : [],
          beverages: menuData.beverages
            ? menuData.beverages.filter((id) => id !== mealToDelete.id)
            : [],
        };

        transaction.set(menuRef, updatedMenu);
      });

      setMeals(meals.filter((meal) => meal.id !== mealToDelete.id));
      setSuccess("Item deleted successfully and removed from the menu!");
    } catch (error) {
      setError("Failed to delete item: " + error.message);
      console.error("Error in handleDeleteMeal:", error);
    } finally {
      setDeleteDialogOpen(false);
      setMealToDelete(null);
      setLoading(false);
    }
  };

  const openDeleteDialog = (meal) => {
    setMealToDelete(meal);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setMealToDelete(null);
  };

  return (
    <Box sx={{ px: 3, bgcolor: "background.default" }}>
      <Typography variant="h4" gutterBottom color="primary">
        Manage Menu
      </Typography>
      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        centered
        sx={{ mb: 3 }}
      >
        <Tab label="Meals & Beverages" value={0} />
        <Tab label="Condiments" value={1} />
      </Tabs>

      {/* Meals & Beverages Tab */}
      {tabValue === 0 && (
        <>
          <Paper elevation={3} sx={{ p: 3, mb: 3, border: "3px solid #ffc523" }}>
            <Box component="form" onSubmit={handleAddMeal}>
              <TextField
                fullWidth
                label="Item Name"
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
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label="Category"
                  required
                  sx={{ bgcolor: "#fff" }}
                >
                  <MenuItem value="meal">Meal</MenuItem>
                  <MenuItem value="beverage">Beverage</MenuItem>
                </Select>
              </FormControl>
              {category === "meal" && (
                <>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Meal Type</InputLabel>
                    <Select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                      label="Meal Type"
                      required
                      sx={{ bgcolor: "#fff" }}
                    >
                      <MenuItem value="">Select a meal type</MenuItem>
                      <MenuItem value="breakfast">Breakfast</MenuItem>
                      <MenuItem value="lunch">Lunch</MenuItem>
                      <MenuItem value="dinner">Dinner</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Components (type and press Enter or click Add)"
                    value={componentInput}
                    onChange={(e) => setComponentInput(e.target.value)}
                    onKeyPress={(e) => handleComponentKeyPress(e)}
                    margin="normal"
                    variant="outlined"
                    sx={{ bgcolor: "#fff" }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handleComponentButtonClick()}
                            edge="end"
                          >
                            <AddIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {components.map((component, index) => (
                      <Chip
                        key={index}
                        label={component}
                        onDelete={() => handleDeleteComponent(component)}
                        color="primary"
                        sx={{ bgcolor: "#0fff50", color: "#000" }}
                      />
                    ))}
                  </Box>
                </>
              )}
              {category === "beverage" && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Meal Type</InputLabel>
                  <Select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    label="Meal Type"
                    required
                    sx={{ bgcolor: "#fff" }}
                  >
                    <MenuItem value="beverages">Beverages</MenuItem>
                  </Select>
                </FormControl>
              )}
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body1" color="primary">
                  Upload Image
                </Typography>
                <Button
                  variant="contained"
                  component="label"
                  color="primary"
                  sx={{ mt: 1 }}
                >
                  Choose Image
                  <input
                    type="file"
                    hidden
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </Button>
                {imageUrl && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={imageUrl}
                      alt="Preview"
                      style={{ maxWidth: "100%", maxHeight: "200px" }}
                    />
                  </Box>
                )}
              </Box>
              <TextField
                fullWidth
                label="Add-ons (type and press Enter or click Add)"
                value={addOnInput}
                onChange={(e) => setAddOnInput(e.target.value)}
                onKeyPress={(e) => handleAddOnKeyPress(e)}
                margin="normal"
                variant="outlined"
                sx={{ bgcolor: "#fff" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleAddOnButtonClick()}
                        edge="end"
                      >
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                {addOns.map((addOn, index) => (
                  <Chip
                    key={index}
                    label={addOn}
                    onDelete={() => handleDeleteAddOn(addOn)}
                    color="primary"
                    sx={{ bgcolor: "#0fff50", color: "#000" }}
                  />
                ))}
              </Box>
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {success}
                </Alert>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Add Item"}
              </Button>
            </Box>
          </Paper>

          {/* Edit Meal Dialog */}
          <Dialog open={!!editMeal} onClose={() => setEditMeal(null)}>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogContent>
              <Box component="form" onSubmit={handleUpdateMeal}>
                <TextField
                  fullWidth
                  label="Item Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  margin="normal"
                  variant="outlined"
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="meal">Meal</MenuItem>
                    <MenuItem value="beverage">Beverage</MenuItem>
                  </Select>
                </FormControl>
                {editCategory === "meal" && (
                  <>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Meal Type</InputLabel>
                      <Select
                        value={editMealType}
                        onChange={(e) => setEditMealType(e.target.value)}
                        label="Meal Type"
                      >
                        <MenuItem value="">None</MenuItem>
                        <MenuItem value="breakfast">Breakfast</MenuItem>
                        <MenuItem value="lunch">Lunch</MenuItem>
                        <MenuItem value="dinner">Dinner</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Components (type and press Enter or click Add)"
                      value={editComponentInput}
                      onChange={(e) => setEditComponentInput(e.target.value)}
                      onKeyPress={(e) => handleComponentKeyPress(e, true)}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => handleComponentButtonClick(true)}
                              edge="end"
                            >
                              <AddIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {editComponents.map((component, index) => (
                        <Chip
                          key={index}
                          label={component}
                          onDelete={() => handleDeleteComponent(component, true)}
                          color="primary"
                          sx={{ bgcolor: "#0fff50", color: "#000" }}
                        />
                      ))}
                    </Box>
                  </>
                )}
                {editCategory === "beverage" && (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Meal Type</InputLabel>
                    <Select
                      value={editMealType}
                      onChange={(e) => setEditMealType(e.target.value)}
                      label="Meal Type"
                    >
                      <MenuItem value="">None</MenuItem>
                      <MenuItem value="beverages">Beverages</MenuItem>
                    </Select>
                  </FormControl>
                )}
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="body1" color="primary">
                    Upload New Image
                  </Typography>
                  <Button
                    variant="contained"
                    component="label"
                    color="primary"
                    sx={{ mt: 1 }}
                  >
                    Choose Image
                    <input
                      type="file"
                      hidden
                      onChange={(e) => handleImageChange(e, true)}
                      accept="image/*"
                    />
                  </Button>
                  {editImageUrl && (
                    <Box sx={{ mt: 2 }}>
                      <img
                        src={editImageUrl}
                        alt="Preview"
                        style={{ maxWidth: "100%", maxHeight: "200px" }}
                      />
                    </Box>
                  )}
                </Box>
                <TextField
                  fullWidth
                  label="Add-ons (type and press Enter or click Add)"
                  value={editAddOnInput}
                  onChange={(e) => setEditAddOnInput(e.target.value)}
                  onKeyPress={(e) => handleAddOnKeyPress(e, true)}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleAddOnButtonClick(true)}
                          edge="end"
                        >
                          <AddIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {editAddOns.map((addOn, index) => (
                    <Chip
                      key={index}
                      label={addOn}
                      onDelete={() => handleDeleteAddOn(addOn, true)}
                      color="primary"
                      sx={{ bgcolor: "#0fff50", color: "#000" }}
                    />
                  ))}
                </Box>
                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditMeal(null)} color="secondary">
                Cancel
              </Button>
              <Button
                onClick={handleUpdateMeal}
                color="primary"
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Save Changes"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete the item "{mealToDelete?.name}"? This
                action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDeleteDialog} color="secondary">
                Cancel
              </Button>
              <Button
                onClick={handleDeleteMeal}
                color="primary"
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Delete"}
              </Button>
            </DialogActions>
          </Dialog>

          <Typography variant="h5" gutterBottom color="primary">
            Current Items
          </Typography>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <CircularProgress color="secondary" />
            </Box>
          ) : (
            <List>
              {meals.map((meal) => (
                <ListItem
                  key={meal.id}
                  sx={{ bgcolor: "#fff", mb: 1, borderRadius: 1 }}
                  secondaryAction={
                    <>
                      <IconButton
                        edge="end"
                        onClick={() => handleEditMeal(meal)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => openDeleteDialog(meal)}
                      >
                        <DeleteIcon color="primary" />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemText
                    primary={meal.name}
                    secondary={`${meal.category === "beverage" ? "Beverage" : "Meal"} - ${meal.description || "No description"}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </>
      )}

      {/* Condiments Tab */}
      {tabValue === 1 && (
        <>
          <Paper elevation={3} sx={{ p: 3, mb: 3, border: "3px solid #ffc523" }}>
            <Typography variant="h5" gutterBottom color="primary">
              Manage Condiments
            </Typography>
            <TextField
              fullWidth
              label="Add Condiment (type and press Enter or click Add)"
              value={condimentInput}
              onChange={(e) => setCondimentInput(e.target.value)}
              onKeyPress={handleCondimentKeyPress}
              margin="normal"
              variant="outlined"
              sx={{ bgcolor: "#fff" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleCondimentButtonClick}
                      edge="end"
                    >
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
              {condiments.map((condiment, index) => (
                <Chip
                  key={index}
                  label={condiment}
                  onDelete={() => handleDeleteCondiment(condiment)}
                  color="primary"
                  sx={{ bgcolor: "#0fff50", color: "#000" }}
                />
              ))}
            </Box>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
}

export default MealManagement;