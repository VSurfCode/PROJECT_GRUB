import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import GrubGoblinLogo from '../assets/GrubGoblinLogo2.png'

function Layout({ children }) {
  const { user, isAdmin, logout, loading } = useAuth(); // Add isAdmin
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "background.default" }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      {user && (
        <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Box sx={{ flexGrow: 1, fontSize: "1.5rem", alignItems: "center", display: 'flex' }}>
                <img src={GrubGoblinLogo} width={100} alt="" />
              <Typography variant="h6">
                GrubGoblin
              </Typography>
            </Box>
            <Button color="inherit" component={NavLink} to="/" sx={{ mx: 1 }}>
              Home
            </Button>
            <Button color="inherit" component={NavLink} to="/my-orders" sx={{ mx: 1 }}>
              My Orders
            </Button>
            <Button color="inherit" component={NavLink} to="/suggestions" sx={{ mx: 1 }}>
              Ideas
            </Button>
            <Button color="inherit" component={NavLink} to="/profile" sx={{ mx: 1 }}>
              Profile
            </Button>
            {isAdmin && ( // Use isAdmin instead of user.isAdmin
              <>
                <Button color="inherit" component={NavLink} to="/admin/meals" sx={{ mx: 1 }}>
                  Meals
                </Button>
                <Button color="inherit" component={NavLink} to="/admin/menu" sx={{ mx: 1 }}>
                  Menu
                </Button>
                <Button color="inherit" component={NavLink} to="/admin/orders" sx={{ mx: 1 }}>
                  Orders
                </Button>
                <Button color="inherit" component={NavLink} to="/admin/suggestions" sx={{ mx: 1 }}>
                  Ideas
                </Button>
              </>
            )}
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
      )}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default", p: 0 }}>
        {children}
      </Box>
    </Box>
  );
}

export default Layout;