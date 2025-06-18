import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  const { user_name, user_email, message } = req.body;
  const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_ID } = process.env;

  if (!user_name || !user_email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await axios.post("https://api.emailjs.com/api/v1.0/email/send", {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_ID,
      template_params: {
        user_name,
        user_email,
        message,
      },
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    return res.status(200).json({ success: true, data: response.data });
  } catch (err) {
    console.error("EmailJS API error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

export default router;
