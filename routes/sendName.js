// server/routes/sendName.js
import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name } = req.body;
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

  if (!name) return res.status(400).json({ error: "Name is required" });

  const message = `🙋‍♂️ New Visitor Name:\n<b>${name}</b>`;

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML",
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Telegram message failed" });
  }
});

export default router;
