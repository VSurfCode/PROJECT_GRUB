import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";
import { FaPinterest } from "react-icons/fa";
import { keyframes } from "@emotion/react";

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

function Suggestions() {
  const [suggestion, setSuggestion] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const maxLength = 500; // Character limit for suggestions

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (suggestion.length > maxLength) {
      setError(`Suggestion must be ${maxLength} characters or less.`);
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "suggestions"), {
        userId: user.uid,
        suggestionText: suggestion,
        timestamp: serverTimestamp(),
      });
      setSuggestion("");
      setSuccess("Suggestion submitted successfully! Thanks for your idea! 🎉");
    } catch (err) {
      setError("Failed to submit suggestion: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        p: 3,
      }}
    >
      <Paper elevation={6} sx={{ p: 4, width: "100%", maxWidth: 400, border: "3px solid #ffc523" }}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          align="center"
          sx={{
            animation: `${bounce} 2s infinite`,
            fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Arial', sans-serif",
            background: "linear-gradient(45deg, #0fff50, #ffc523)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Share Your Tasty Ideas! 🍽️
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Suggestion"
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="Got a meal idea? Maybe something you saw on Pinterest or Instagram? Share it here! 😋"
            required
            margin="normal"
            variant="outlined"
            sx={{ bgcolor: "#fff" }}
            inputProps={{
              maxLength: maxLength,
              "aria-label": "Enter your meal suggestion",
            }}
            helperText={`${suggestion.length}/${maxLength} characters`}
          />
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
            sx={{
              mt: 3,
              py: 1.5,
              bgcolor: "#0fff50",
              color: "#000000",
              "&:hover": { bgcolor: "#3a3e43" },
            }}
            disabled={loading}
            aria-label="Submit your suggestion"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Suggestion"}
          </Button>
        </Box>
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
          <FaPinterest style={{ color: "#E60023", fontSize: { xs: "16px", sm: "20px" } }} />
          <Link
            href="https://www.pinterest.com/daniellenatale1/food-and-drink/"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{
              color: "#000",
              "&:hover": { color: "#3a3e43" },
              fontSize: { xs: "0.875rem", sm: "1rem" },
              textShadow: "1px 1px 1px rgba(0, 0, 0, 0.2)",
            }}
            aria-label="Visit our Pinterest food and drink board"
          >
            Check out our Pinterest Food Board!
          </Link>
        </Box>
      </Paper>
    </Box>
  );
}

export default Suggestions;