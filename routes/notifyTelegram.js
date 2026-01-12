import axios from "axios";
import express from "express";
import { decryptText } from "../utils/crypto.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, BASE_TELEGRAM_URL } = process.env;
    const { payload } = req.body;

    const decryptedJson = decryptText(payload);

    const {
      country_name,
      city,
      region,
      ip,
      latitude,
      longitude,
      timestamp,
      referral,
      device,
      os,
      browser
    } = JSON.parse(decryptedJson);

    const message = `
👀 <b>You've Got a Visitor!</b>

<b>Country:</b> ${country_name}
<b>Location:</b> ${city}, ${region}
<b>IP Address:</b> ${ip}
<b>Time:</b> ${timestamp}

<b>Referral:</b> ${referral}
<b>Device:</b> ${device}
<b>OS:</b> ${os}
<b>Browser:</b> ${browser}

<b>Map:</b> https://www.google.com/maps?q=${latitude},${longitude}
`;

    await axios.post(
      `${BASE_TELEGRAM_URL}/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML"
      }
    );

    res.status(200).send("Tracked");
  } catch (err) {
    console.error("Tracking failed:", err);
    res.status(500).send("Error");
  }
});

export default router;
