import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import sendNameRoute from "./routes/sendName.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/send-name", sendNameRoute);

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
console.log("TELEGRAM_BOT_TOKEN: ", TELEGRAM_BOT_TOKEN);
console.log("TELEGRAM_CHAT_ID: ", TELEGRAM_CHAT_ID);

app.post("/api/notify-telegram", async (req, res) => {
  const { country_name, city, region, ip, latitude, longitude, timestamp } =
    req.body;

  const message = `
👀 You've Got a Visitor!
    
*Country: <b>${country_name}</b>
*Location: <b>${city}, ${region}</b>
*IP Address: <b>${ip}</b>
*Time: <b>${timestamp}</b>
*Map: <b>https://www.google.com/maps?q=${latitude},${longitude}</b>
    `;

  try {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }
    );

    console.log("axios: ", axios);
    res.status(200).send("Notification sent");
  } catch (err) {
    console.error("Telegram error:", err.response?.data || err.message || err);
    res.status(500).send("Failed to send notification");
  }
});

app.listen(5000, () => {
  console.log("🚀 Backend running on http://localhost:5000");
});
