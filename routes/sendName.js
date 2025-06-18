import axios from "axios";
import express from "express";
import { decryptText } from "../utils/crypto.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name: encryptedName } = req.body;
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

  if (!encryptedName)
    return res.status(400).json({ error: "Name is required" });

  let name;
  try {
    name = decryptText(encryptedName);
  } catch (err) {
    return res.status(400).json({ error: "Invalid encrypted name" });
  }

  const message = `🙋‍♂️ New Visitor Name:\n<b>${name}</b>`;

  try {
    await axios.post(
      `${BASE_TELEGRAM_URL}/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Telegram message failed" });
  }
});

export default router;
