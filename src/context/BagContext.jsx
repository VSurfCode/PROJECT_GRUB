import { createContext, useContext, useState, useEffect } from "react";

const BagContext = createContext();

export function BagProvider({ children }) {
  const [bag, setBag] = useState(() => {
    // Load initial bag state from localStorage if available
    const savedBag = localStorage.getItem("bag");
    return savedBag ? JSON.parse(savedBag) : [];
  });

  // Save bag to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("bag", JSON.stringify(bag));
  }, [bag]);

  // Function to clear the bag (e.g., after placing an order)
  const clearBag = () => {
    setBag([]);
    localStorage.removeItem("bag");
  };

  return (
    <BagContext.Provider value={{ bag, setBag, clearBag }}>
      {children}
    </BagContext.Provider>
  );
}

export function useBag() {
  const context = useContext(BagContext);
  if (!context) {
    throw new Error("useBag must be used within a BagProvider");
  }
  return context;
}