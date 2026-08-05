import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());

const PORT = 8080;

// 📰 Route for news
app.get("/api/news", async (req, res) => {
  try {
    const response = await fetch(
      "https://newsapi.org/v2/top-headlines?country=in&category=business&apiKey=5e528dd35d6548b693e2494ca379463b"
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// 💱 Route for market
app.get("/api/market", async (req, res) => {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=INR&apikey=6f2393fdeb2449afa76ee627b733e983`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
