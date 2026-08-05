// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;

app.post("/api/voice", async (req, res) => {
  const { userInput } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful AI financial assistant." },
          { role: "user", content: userInput },
        ],
      }),
    });

    const result = await response.json();
    console.log("Result:", result);

    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error fetching AI response." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
