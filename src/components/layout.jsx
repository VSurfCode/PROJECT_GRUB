import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useBag } from "../context/BagContext";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import Bag from "../components/Bag";
import Notifications from "../components/Notifications"; // Import the Notifications component
import GrubGoblinLogo from "../assets/GrubGoblinLogo2.png";

function Layout({ children }) {
  const { user, isAdmin, logout, loading } = useAuth();
  const { bag } = useBag();
  const [bagOpen, setBagOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
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

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/my-orders", label: "My Orders" },
    { to: "/suggestions", label: "Ideas" },
    { to: "/profile", label: "Profile" },
  ];

  const adminLinks = [
    { to: "/admin/meals", label: "Meals" },
    { to: "/admin/menu", label: "Menu" },
    { to: "/admin/orders", label: "Orders" },
    { to: "/admin/suggestions", label: "Ideas" },
  ];

  const drawerContent = (
    <Box
      sx={{ width: 250, bgcolor: "#2a2e33", height: "100%", color: "#ffffff" }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
        <img src={GrubGoblinLogo} width={50} alt="GrubGoblin Logo" />
        <Typography variant="h6" sx={{ ml: 1 }}>
          GrubGoblin
        </Typography>
      </Box>
      <Divider sx={{ bgcolor: "#0fff50" }} />
      <List>
        {navLinks.map((link) => (
          <ListItem
            key={link.label}
            component={NavLink}
            to={link.to}
            sx={{
              color: "#ffffff",
              "&.active": { bgcolor: "#000", color: "#fff" },
              "&:hover": { bgcolor: "#3a3e43" },
            }}
          >
            <ListItemText primary={link.label} />
          </ListItem>
        ))}
        {isAdmin && (
          <>
            <Divider sx={{ bgcolor: "#0fff50", my: 1 }} />
            <Typography variant="subtitle1" sx={{ px: 2, color: "#0fff50" }}>
              Admin
            </Typography>
            {adminLinks.map((link) => (
              <ListItem
                key={link.label}
                component={NavLink}
                to={link.to}
                sx={{
                  color: "#ffffff",
                  "&.active": { bgcolor: "#000", color: "#fff" },
                  "&:hover": { bgcolor: "#3a3e43" },
                }}
              >
                <ListItemText primary={link.label} />
              </ListItem>
            ))}
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {user && (
        <>
          <AppBar
            position="static"
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={toggleDrawer(true)}
                sx={{ display: { xs: "block", sm: "none" }, mr: 2 }}
              >
                <MenuIcon />
              </IconButton>

              <Box
                sx={{
                  flexGrow: 1,
                  fontSize: "1.5rem",
                  alignItems: "center",
                  display: "flex",
                }}
              >
                <img src={GrubGoblinLogo} width={100} alt="GrubGoblin Logo" />
                <Typography variant="h6">GrubGoblin</Typography>
              </Box>

              <Box sx={{ display: { xs: "none", sm: "flex" } }}>
                {navLinks.map((link) => (
                  <Button
                    key={link.label}
                    color="inherit"
                    component={NavLink}
                    to={link.to}
                    sx={{
                      mx: 1,
                      "&.active": { bgcolor: "#000", color: "#fff" },
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
                {isAdmin && (
                  <>
                    {adminLinks.map((link) => (
                      <Button
                        key={link.label}
                        color="inherit"
                        component={NavLink}
                        to={link.to}
                        sx={{
                          mx: 1,
                          "&.active": { bgcolor: "#000", color: "#fff" },
                        }}
                      >
                        {link.label}
                      </Button>
                    ))}
                  </>
                )}
              </Box>

              <Notifications /> {/* Add the Notifications component */}

              <IconButton
                onClick={() => setBagOpen(true)}
                color="inherit"
                sx={{ mx: 1, position: "relative" }}
              >
                <ShoppingBagIcon />
                {bag.length > 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      bgcolor: "#fff",
                      color: "#000",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                    }}
                  >
                    {bag.length}
                  </Box>
                )}
              </IconButton>

              <Button
                variant="contained"
                color="secondary"
                onClick={handleLogout}
                sx={{ mx: 1, px: 3 }}
              >
                Logout
              </Button>
            </Toolbar>
          </AppBar>

          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: 250 },
            }}
          >
            {drawerContent}
          </Drawer>
        </>
      )}

      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: "background.default", p: 0 }}
      >
        {children}
      </Box>

      {user && (
        <Bag
          open={bagOpen}
          onClose={() => setBagOpen(false)}
          user={user}
        />
      )}
    </Box>
  );
}

export default Layout;