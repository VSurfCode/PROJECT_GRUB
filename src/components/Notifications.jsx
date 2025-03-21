import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import useNotifications from "../hooks/useNotifications";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Drawer,
  Badge,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";

function Notifications() {
  const { user } = useAuth();
  const { notifications, loading, error } = useNotifications(user?.uid);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) return null;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <>
      <IconButton
        onClick={() => setDrawerOpen(true)}
        color="inherit"
        sx={{ position: "relative" }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 300, p: 2, bgcolor: "#2a2e33", color: "#ffffff", height: "100%", mt: '35px' }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" color="#0fff50">
              Notifications
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: "#0fff50" }}>
              <CloseIcon />
            </IconButton>
          </Box>
          {notifications.length === 0 ? (
            <Typography>No notifications yet.</Typography>
          ) : (
            <List>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    bgcolor: notification.read ? "#000000" : "#ffffff",
                    color: notification.read ? "#ffffff" : "#000000",
                    borderRadius: 1,
                    mb: 1,
                  }}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                >
                  <ListItemText
                    primary={notification.message}
                    secondary={notification.timestamp?.toDate().toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
    </>
  );
}

export default Notifications;