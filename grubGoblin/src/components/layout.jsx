import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div>
      {user && (
        <nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/place-order">Place Order</NavLink>
          <NavLink to="/my-orders">My Orders</NavLink>
          <NavLink to="/suggestions">Suggestions</NavLink>
          {user.isAdmin && (
            <>
              <NavLink to="/admin/meals">Meal Management</NavLink>
              <NavLink to="/admin/menu">Menu Management</NavLink>
              <NavLink to="/admin/orders">Orders</NavLink>
              <NavLink to="/admin/suggestions">Suggestions</NavLink>
            </>
          )}
          <button onClick={handleLogout}>Logout</button>
        </nav>
      )}
      <main>{children}</main>
    </div>
  );
}

export default Layout;