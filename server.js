const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const TOKEN = "mon_token_secret_123";

app.post("/pronote/bridge", async (req, res) => {
  const auth = req.headers["authorization"];

  if (auth !== `Bearer ${TOKEN}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { action } = req.body;

  if (action === "ping") {
    return res.json({ result: "pong" });
  }

  return res.json({ error: "unknown action" });
});

app.listen(3000, () => {
  console.log("Bridge running on http://localhost:3000");
});