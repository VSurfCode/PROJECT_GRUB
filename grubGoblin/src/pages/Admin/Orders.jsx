import useOrders from "../../hooks/useOrders";
import useMeals from "../../hooks/useMeals";

function Orders() {
  const orders = useOrders();
  const mealIds = orders.map((order) => order.mealId);
  const meals = useMeals(mealIds);

  return (
    <div>
      <h1>All Orders</h1>
      {orders.map((order) => {
        const meal = meals.find((m) => m.id === order.mealId);
        return (
          <div key={order.id}>
            <h3>{meal?.name || "Loading..."}</h3>
            <p>User: {order.userId}</p>
            <p>Meal Type: {order.mealType}</p>
            <p>Add-ons: {order.addOns.join(", ") || "None"}</p>
            <p>Time: {order.timestamp?.toDate().toLocaleString()}</p>
          </div>
        );
      })}
    </div>
  );
}

export default Orders;