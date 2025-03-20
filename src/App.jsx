import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyOrders from "./pages/MyOrders";
import Suggestions from "./pages/Suggestions";
import Profile from "./pages/Profile";
import MealManagement from "./pages/Admin/MealManagement";
import MenuManagement from "./pages/Admin/MenuManagement";
import AdminOrders from "./pages/Admin/Orders";
import AdminSuggestions from "./pages/Admin/Suggestions";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
            <Route path="/suggestions" element={<ProtectedRoute><Suggestions /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> {/* Add Profile route */}
            <Route path="/admin/meals" element={<ProtectedRoute requireAdmin><MealManagement /></ProtectedRoute>} />
            <Route path="/admin/menu" element={<ProtectedRoute requireAdmin><MenuManagement /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/suggestions" element={<ProtectedRoute requireAdmin><AdminSuggestions /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;