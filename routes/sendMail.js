import emailjs from 'emailjs-com';
import express from "express";
import { decryptText } from "../utils/crypto.js";

const router = express.Router();

router.post('/', async (req, res) => {
  const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_ID} = process.env;

  const { user_name, user_email, message } = req.body;

  if (!user_name || !user_email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const decryptedMessage = decryptText(message);

    if (!decryptedMessage) {
      return res.status(400).json({ error: "Failed to decrypt message" });
    }

    await emailjs.send(
      EMAILJS_SERVICE_ID,     
      EMAILJS_TEMPLATE_ID,   
      {
        user_name,
        user_email,
        message: decryptedMessage,
      },
      EMAILJS_PUBLIC_ID   
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
