import { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot, collection } from "firebase/firestore";
import { db } from "../../firebase";
import {
  Box,
  Typography,
  Paper,
  FormControlLabel,
  Checkbox,
  Button,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";

function MenuManagement() {
  const [meals, setMeals] = useState([]);
  const [menu, setMenu] = useState({ breakfast: [], lunch: [], dinner: [] });
  const [draftMenu, setDraftMenu] = useState({ breakfast: [], lunch: [], dinner: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const mealsUnsub = onSnapshot(collection(db, "meals"), (snapshot) => {
      const mealsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMeals(mealsList);

      // Filter the menu to only include existing meal IDs
      setMenu((prevMenu) => {
        const validMealIds = new Set(mealsList.map((meal) => meal.id));
        return {
          breakfast: prevMenu.breakfast.filter((id) => validMealIds.has(id)),
          lunch: prevMenu.lunch.filter((id) => validMealIds.has(id)),
          dinner: prevMenu.dinner.filter((id) => validMealIds.has(id)),
        };
      });

      setDraftMenu((prevDraftMenu) => {
        const validMealIds = new Set(mealsList.map((meal) => meal.id));
        return {
          breakfast: prevDraftMenu.breakfast.filter((id) => validMealIds.has(id)),
          lunch: prevDraftMenu.lunch.filter((id) => validMealIds.has(id)),
          dinner: prevDraftMenu.dinner.filter((id) => validMealIds.has(id)),
        };
      });
    });

    const menuUnsub = onSnapshot(doc(db, "currentMenu", "today"), (docSnap) => {
      const menuData = docSnap.exists()
        ? docSnap.data()
        : { breakfast: [], lunch: [], dinner: [] };
      setMenu(menuData);
      setDraftMenu(menuData);
      setLoading(false);
    });

    return () => {
      mealsUnsub();
      menuUnsub();
    };
  }, []);

  const handleCheckboxChange = (mealType, mealId) => {
    setDraftMenu((prev) => {
      const updated = { ...prev };
      if (updated[mealType].includes(mealId)) {
        updated[mealType] = updated[mealType].filter((id) => id !== mealId);
      } else {
        updated[mealType] = [...updated[mealType], mealId];
      }
      return updated;
    });
  };

  const handleSaveMenu = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await setDoc(doc(db, "currentMenu", "today"), draftMenu);
      setMenu(draftMenu);
      setSuccess("Menu updated successfully! 🍽️");
    } catch (err) {
      setError("Failed to update menu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: "background.default" }}>
      <Typography
        variant="h4"
        gutterBottom
        color="primary"
        align="center"
        sx={{
          fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Arial', sans-serif",
          background: "linear-gradient(45deg, #0fff50, #ffc523)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Manage Today’s Menu! 📋
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {["breakfast", "lunch", "dinner"].map((type) => (
        <Paper
          key={type}
          elevation={3}
          sx={{
            p: 3,
            mb: 3,
            border: "3px solid #ffc523",
            bgcolor: "#fff",
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <Typography variant="h5" gutterBottom color="text.primary">
            {type.charAt(0).toUpperCase() + type.slice(1)} (
            {draftMenu[type].length} selected)
          </Typography>
          {meals.length === 0 ? (
            <Typography color="secondary">
              No meals available.{" "}
              <Link href="/admin/meals" sx={{ color: "#0fff50" }}>
                Add some meals first!
              </Link>
            </Typography>
          ) : (
            <Box sx={{ maxHeight: "300px", overflowY: "auto", pr: 1 }}>
              {meals.map((meal) => (
                <FormControlLabel
                  key={meal.id}
                  control={
                    <Checkbox
                      checked={draftMenu[type].includes(meal.id)}
                      onChange={() => handleCheckboxChange(type, meal.id)}
                      color="primary"
                      sx={{
                        "&.Mui-checked": {
                          color: "#0fff50",
                        },
                      }}
                      inputProps={{
                        "aria-label": `Add ${meal.name} to ${type} menu`,
                      }}
                    />
                  }
                  label={meal.name}
                  sx={{
                    display: "block",
                    bgcolor: draftMenu[type].includes(meal.id)
                      ? "rgba(15, 255, 80, 0.1)"
                      : "transparent",
                    p: 1,
                    borderRadius: 1,
                    "&:hover": {
                      bgcolor: "rgba(15, 255, 80, 0.2)",
                    },
                  }}
                />
              ))}
            </Box>
          )}
        </Paper>
      ))}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{
          mt: 2,
          py: 1.5,
          bgcolor: "#0fff50",
          color: "#000000",
          "&:hover": { bgcolor: "#3a3e43" },
        }}
        onClick={handleSaveMenu}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Save Menu"}
      </Button>
    </Box>
  );
}

export default MenuManagement;