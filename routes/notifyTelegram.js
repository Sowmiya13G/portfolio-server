import axios from "axios";
import express from "express";
import { decryptText } from "../utils/crypto";

const router = express.Router();

router.post("/", async (req, res) => {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  const { country_name, city, region, ip, latitude, longitude, timestamp } =
    req.body;

  const decryptedCountry = decryptText(country_name);
  const decryptedCity = decryptText(city);
  const decryptedRegion = decryptText(region);
  const decryptedIP = decryptText(ip);
  const decryptedLatitude = decryptText(latitude);
  const decryptedLongitude = decryptText(longitude);
  const decryptedTimestamp = decryptText(timestamp);

  const message = `
👀 You've Got a Visitor!

<b>Country:</b> ${decryptedCountry}
<b>Location:</b> ${decryptedCity}, ${decryptedRegion}
<b>IP Address:</b> ${decryptedIP}
<b>Time:</b> ${decryptedTimestamp}
<b>Map:</b> https://www.google.com/maps?q=${decryptedLatitude},${decryptedLongitude}
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

    res.status(200).send("Notification sent");
  } catch (err) {
    console.error("Telegram error:", err.response?.data || err.message);
    res.status(500).send("Failed to send notification");
  }
});

export default router;
