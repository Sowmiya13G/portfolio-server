import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/", async (req, res) => {
  const { user_name, user_email, message } = req.body;
  const { EMAIL_USER, EMAIL_PASS } =
  process.env;
  if (!user_name || !user_email || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${user_name}" <${user_email}>`,
      to: process.env.EMAIL_USER,
      subject: "New message from portfolio",
      text: message,
      replyTo: user_email,  
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Nodemailer error:", err);
    res.status(500).json({ error: "Email send failed" });
  }
});

export default router;
