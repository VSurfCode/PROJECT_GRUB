import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from "firebase/auth";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

function Profile() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.displayName || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [showReauth, setShowReauth] = useState(false);
  const [reauthAction, setReauthAction] = useState(null);
  const navigate = useNavigate();

  const handleUpdateName = async () => {
    setError("");
    setSuccess("");
    try {
      await updateProfile(user, { displayName: name });
      await updateDoc(doc(db, "users", user.uid), { name });
      setSuccess("Name updated successfully!");
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        setReauthAction("updateName");
        setShowReauth(true);
      } else {
        setError("Failed to update name: " + err.message);
      }
    }
  };

  const handleReauthenticate = async () => {
    setError("");
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      setShowReauth(false);
      if (reauthAction === "updateName") {
        await handleUpdateName();
      } else if (reauthAction === "deleteAccount") {
        await handleDeleteAccount();
      }
    } catch (err) {
      setError("Re-authentication failed: " + err.message);
    }
  };

  const handleDeleteAccount = async () => {
    setError("");
    try {
      // Debug: Log the user object to ensure it's valid
      console.log("User object before deletion:", user);

      // Delete user's orders from Firestore
      const ordersQuery = query(collection(db, "orders"), where("userId", "==", user.uid));
      const ordersSnapshot = await getDocs(ordersQuery);
      const deleteOrderPromises = ordersSnapshot.docs.map((orderDoc) =>
        deleteDoc(doc(db, "orders", orderDoc.id))
      );
      await Promise.all(deleteOrderPromises);

      // Delete user data from Firestore
      await deleteDoc(doc(db, "users", user.uid));

      // Delete user from Firebase Authentication
      await deleteUser(user);

      // Log out the user
      await logout();
      navigate("/login");
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        setReauthAction("deleteAccount");
        setShowReauth(true);
      } else {
        setError("Failed to delete account: " + err.message);
        setOpenDeleteDialog(false);
      }
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
        <Typography variant="h5" component="h2" gutterBottom align="center" color="primary">
          Your Profile
        </Typography>
        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleUpdateName(); }} sx={{ mt: 2 }}>
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
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            Update Name
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            sx={{ mb: 2, py: 1.5 }}
            onClick={() => setOpenDeleteDialog(true)}
          >
            Delete Account
          </Button>
        </Box>
      </Paper>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ bgcolor: "#0fff50", color: "#000" }}>
          Are You Sure?
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "#ffffff", mt: 2 }}>
          <Typography>
            Deleting your account is permanent and cannot be undone. All your orders and data will be removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ bgcolor: "#ffffff" }}>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Re-authentication Dialog */}
      <Dialog open={showReauth} onClose={() => setShowReauth(false)}>
        <DialogTitle sx={{ bgcolor: "#0fff50", color: "#000" }}>
          Please Re-authenticate
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "#ffffff", mt: 2 }}>
          <Typography>
            For security reasons, please enter your password to confirm your identity.
          </Typography>
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
        </DialogContent>
        <DialogActions sx={{ bgcolor: "#ffffff" }}>
          <Button onClick={() => setShowReauth(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleReauthenticate} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Profile;