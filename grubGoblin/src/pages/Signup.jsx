import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { updateProfile } from "firebase/auth"; // Add updateProfile
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Link as MuiLink,
  Alert,
} from "@mui/material";
import GrubGoblinLogo from '../assets/GrubGoblinLogo2.png'

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signup(email, password);
      const user = userCredential.user;

      // Update the user's display name in Firebase Authentication
      await updateProfile(user, { displayName: name }); // Use updateProfile function

      // Save the user's name to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        isAdmin: false,
      });

      navigate("/");
    } catch (err) {
      setError("Sign-up failed. " + err.message);
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
      }}
    >
      <Paper elevation={6} sx={{ p: 4, width: "100%", maxWidth: 400, border: "3px solid #ffc523" }}>
        <Box sx={{ flexGrow: 1, fontSize: "1.5rem", alignItems: "center", justifyContent: 'center', display: 'flex' }}>
            <img src={GrubGoblinLogo} width={250} alt="" />
        </Box>
        <Box component="form" onSubmit={handleSignup} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            margin="normal"
            variant="outlined"
            sx={{ bgcolor: "#fff" }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            margin="normal"
            variant="outlined"
            sx={{ bgcolor: "#fff" }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            margin="normal"
            variant="outlined"
            sx={{ bgcolor: "#fff" }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            Sign Up!
          </Button>
          <Typography variant="body2" align="center">
            Already in?{" "}
            <MuiLink href="/login" underline="hover" color="secondary">
              Login Here!
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Signup;