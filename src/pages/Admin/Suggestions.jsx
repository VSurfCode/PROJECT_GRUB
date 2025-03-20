import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Link,
  CircularProgress,
} from "@mui/material";
import axios from "axios"; // For fetching URL metadata

function Suggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Fetch metadata for a URL using Microlink
  const fetchUrlMetadata = async (url) => {
    try {
      const response = await axios.get(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching URL metadata:", error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "suggestions"), async (snapshot) => {
      setLoading(true);
      const suggestionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch user names and URL metadata for each suggestion
      const enrichedSuggestions = await Promise.all(
        suggestionsData.map(async (sug) => {
          // Fetch user name from users collection
          let userName = "Unknown User";
          try {
            const userDoc = await getDoc(doc(db, "users", sug.userId));
            if (userDoc.exists()) {
              userName = userDoc.data().name || userDoc.data().email || "Unknown User";
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }

          // Extract URLs from suggestionText
          const urls = sug.suggestionText.match(urlRegex) || [];
          const metadata = await Promise.all(
            urls.map(async (url) => {
              const meta = await fetchUrlMetadata(url);
              return { url, metadata: meta };
            })
          );

          return {
            ...sug,
            userName,
            links: metadata,
          };
        })
      );

      setSuggestions(enrichedSuggestions);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "background.default" }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: "background.default" }}>
      <Typography variant="h4" gutterBottom color="primary" align="center">
        All Suggestions
      </Typography>
      {suggestions.length === 0 ? (
        <Typography color="secondary" align="center">
          No suggestions yet!
        </Typography>
      ) : (
        suggestions.map((sug) => (
          <Paper
            key={sug.id}
            elevation={3}
            sx={{
              p: 3,
              mb: 3,
              border: "3px solid #ffc523",
              bgcolor: "#fff",
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.02)" },
            }}
          >
            <Typography variant="body1" color="text.primary">
              <strong>User:</strong> {sug.userName}
            </Typography>
            <Typography variant="body1" color="text.primary" sx={{ mt: 1 }}>
              <strong>Suggestion:</strong>{" "}
              {sug.suggestionText.split(urlRegex).map((part, index) => {
                const matchingLink = sug.links.find((link) => link.url === part);
                if (matchingLink) {
                  return (
                    <Box key={index} sx={{ mt: 2 }}>
                      <Card
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          bgcolor: "#f5f5f5",
                          transition: "transform 0.2s",
                          "&:hover": { transform: "scale(1.01)" },
                        }}
                      >
                        {matchingLink.metadata?.image?.url && (
                          <CardMedia
                            component="img"
                            sx={{ width: 100, height: 100, objectFit: "cover" }}
                            image={matchingLink.metadata.image.url}
                            alt={matchingLink.metadata.title || "Link preview"}
                            onError={(e) => (e.target.src = "https://via.placeholder.com/100")}
                          />
                        )}
                        <CardContent sx={{ flex: 1 }}>
                          <Link
                            href={matchingLink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            sx={{ color: "#0fff50", fontWeight: "bold" }}
                          >
                            {matchingLink.metadata?.title || matchingLink.url}
                          </Link>
                          <Typography variant="body2" color="text.secondary">
                            {matchingLink.metadata?.description || "No description available"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new URL(matchingLink.url).hostname}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  );
                }
                return part;
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <strong>Time:</strong>{" "}
              {sug.timestamp?.toDate().toLocaleString() || "Unknown"}
            </Typography>
          </Paper>
        ))
      )}
    </Box>
  );
}

export default Suggestions;