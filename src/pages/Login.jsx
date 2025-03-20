import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import GrubGoblinLogo from '../assets/GrubGoblinLogo2.png'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Link as MuiLink,
  Alert,
} from "@mui/material";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError("Login failed. Check your credentials.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Paper elevation={6} sx={{ p: 4, width: "100%", maxWidth: 400, border: "3px solid #ffc523" }}>
        <Box sx={{ flexGrow: 1, fontSize: "1.5rem", alignItems: "center", justifyContent: 'center', display: 'flex' }}>
            <img src={GrubGoblinLogo} width={250} alt="" />
        </Box>
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
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
            Let’s Eat!
          </Button>
          <Typography variant="body2" align="center">
            New here?{" "}
            <MuiLink href="/signup" underline="hover" color="text.secondary">
              Join the Party!
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;