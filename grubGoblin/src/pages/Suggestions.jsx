import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

function Suggestions() {
  const [suggestion, setSuggestion] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "suggestions"), {
      userId: user.uid,
      suggestionText: suggestion,
      timestamp: serverTimestamp(),
    });
    setSuggestion("");
  };

  return (
    <div>
      <h1>Submit a Suggestion</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          placeholder="Suggest a meal (e.g., from Pinterest or Instagram)"
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Suggestions;