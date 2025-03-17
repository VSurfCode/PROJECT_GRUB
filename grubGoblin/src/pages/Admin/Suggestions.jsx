import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

function Suggestions() {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "suggestions"), (snapshot) => {
      setSuggestions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h1>All Suggestions</h1>
      {suggestions.map((sug) => (
        <div key={sug.id}>
          <p>User: {sug.userId}</p>
          <p>{sug.suggestionText}</p>
          <p>Time: {sug.timestamp?.toDate().toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

export default Suggestions;