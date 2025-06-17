import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  const { country_name, city, region, ip, latitude, longitude, timestamp } =
    req.body;

  const message = `
👀 You've Got a Visitor!

<b>Country:</b> ${country_name}
<b>Location:</b> ${city}, ${region}
<b>IP Address:</b> ${ip}
<b>Time:</b> ${timestamp}
<b>Map:</b> https://www.google.com/maps?q=${latitude},${longitude}
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
