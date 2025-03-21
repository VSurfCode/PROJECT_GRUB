import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BagProvider } from "./context/BagContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyOrders from "./pages/MyOrders";
import MyOrderDetails from "./components/MyOrderDetails";
import Suggestions from "./pages/Suggestions";
import Profile from "./pages/Profile";
import MealManagement from "./pages/Admin/MealManagement";
import MenuManagement from "./pages/Admin/MenuManagement";
import AdminOrders from "./pages/Admin/Orders";
import AdminSuggestions from "./pages/Admin/Suggestions";
import OrderDetails from "./pages/OrderDetails";

function App() {
  return (
    <AuthProvider>
      <BagProvider>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute>
                    <MyOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-orders/:orderId"
                element={
                  <ProtectedRoute>
                    <MyOrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/suggestions"
                element={
                  <ProtectedRoute>
                    <Suggestions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderDetails />    
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />{" "}
              {/* Add Profile route */}
              <Route
                path="/admin/meals"
                element={
                  <ProtectedRoute requireAdmin>
                    <MealManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/menu"
                element={
                  <ProtectedRoute requireAdmin>
                    <MenuManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/suggestions"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminSuggestions />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </HashRouter>
      </BagProvider>
    </AuthProvider>
  );
}

export default App;
