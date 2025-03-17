import useOrders from "../hooks/useOrders";
import useMeals from "../hooks/useMeals";
import { useAuth } from "../context/AuthContext";

function MyOrders() {
  const { user } = useAuth();
  const orders = useOrders(user.uid);
  const mealIds = orders.map((order) => order.mealId);
  const meals = useMeals(mealIds);

  return (
    <div>
      <h1>My Orders</h1>
      {orders.map((order) => {
        const meal = meals.find((m) => m.id === order.mealId);
        return (
          <div key={order.id}>
            <h3>{meal?.name || "Loading..."}</h3>
            <p>Meal Type: {order.mealType}</p>
            <p>Add-ons: {order.addOns.join(", ") || "None"}</p>
            <p>Time: {order.timestamp?.toDate().toLocaleString()}</p>
          </div>
        );
      })}
    </div>
  );
}

export default MyOrders;