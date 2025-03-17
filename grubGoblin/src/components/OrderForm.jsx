import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

function OrderForm({ meal, mealType, onClose }) {
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "orders"), {
      userId: user.uid,
      mealId: meal.id,
      mealType,
      addOns: selectedAddOns,
      timestamp: serverTimestamp(),
    });
    onClose();
  };

  const toggleAddOn = (addOn) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOn) ? prev.filter((a) => a !== addOn) : [...prev, addOn]
    );
  };

  return (
    <div>
      <h2>Order {meal.name}</h2>
      <form onSubmit={handleSubmit}>
        <p>Select add-ons:</p>
        {meal.addOns.map((addOn) => (
          <label key={addOn}>
            <input
              type="checkbox"
              checked={selectedAddOns.includes(addOn)}
              onChange={() => toggleAddOn(addOn)}
            />
            {addOn}
          </label>
        ))}
        <button type="submit">Place Order</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
}

export default OrderForm;