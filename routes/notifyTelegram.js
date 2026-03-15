// import axios from "axios";
// import express from "express";
// import { decryptText } from "../utils/crypto.js";

// const router = express.Router();

// router.post("/", async (req, res) => {
//   try {
//     const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, BASE_TELEGRAM_URL } = process.env;
//     const { payload } = req.body;

//     const decryptedJson = decryptText(payload);

//     const {
//       country_name,
//       city,
//       region,
//       ip,
//       latitude,
//       longitude,
//       timestamp,
//       referral,
//       device,
//       os,
//       browser
//     } = JSON.parse(decryptedJson);

//     const message = `
// 👀 <b>You've Got a Visitor!</b>

// <b>Country:</b> ${country_name}
// <b>Location:</b> ${city}, ${region}
// <b>IP Address:</b> ${ip}
// <b>Time:</b> ${timestamp}

// <b>Referral:</b> ${referral}
// <b>Device:</b> ${device}
// <b>OS:</b> ${os}
// <b>Browser:</b> ${browser}

// <b>Map:</b> https://www.google.com/maps?q=${latitude},${longitude}
// `;

//     await axios.post(
//       `${BASE_TELEGRAM_URL}/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
//       {
//         chat_id: TELEGRAM_CHAT_ID,
//         text: message,
//         parse_mode: "HTML"
//       }
//     );

//     res.status(200).send("Tracked");
//   } catch (err) {
//     console.error("Tracking failed:", err);
//     res.status(500).send("Error");
//   }
// });

// export default router;
import axios from "axios";
import express from "express";
import { decryptText } from "../utils/crypto.js";

const router = express.Router();

// ─── Bot Detection ───────────────────────────────────────────────────────────

const BOT_ISPS = [
  "Microsoft Corporation", "Google LLC", "Amazon.com, Inc.",
  "Cloudflare, Inc.", "Facebook, Inc.", "Meta Platforms",
  "Apple Inc.", "Twitter Inc.",
];

const BOT_UA_KEYWORDS = [
  "bot", "crawler", "spider", "preview", "facebookexternalhit",
  "linkedinbot", "twitterbot", "slackbot", "telegrambot",
  "whatsapp", "bingbot", "googlebot", "applebot", "semrush", "ahrefsbot",
];

const DATACENTER_KEYWORDS = [
  "hosting", "datacenter", "data center", "cloud", "server", "vps",
];

function detectVisitorType({ isp = "", browser = "" }) {
  const ispLower = isp.toLowerCase();
  const uaLower = browser.toLowerCase();

  if (BOT_UA_KEYWORDS.some((k) => uaLower.includes(k))) return "bot";
  if (BOT_ISPS.some((b) => isp.includes(b))) return "suspicious";
  if (DATACENTER_KEYWORDS.some((k) => ispLower.includes(k))) return "suspicious";
  return "human";
}

function detectBotSource({ isp = "", browser = "" }) {
  const uaLower = browser.toLowerCase();

  if (uaLower.includes("linkedinbot")) return "LinkedIn Preview Bot";
  if (uaLower.includes("bingbot"))     return "Bing Crawler";
  if (uaLower.includes("googlebot"))   return "Google Crawler";
  if (uaLower.includes("twitterbot"))  return "Twitter Preview Bot";
  if (uaLower.includes("slackbot"))    return "Slack Preview Bot";
  if (isp.includes("Microsoft"))       return "Microsoft <i>(Bing / Defender / LinkedIn)</i>";
  if (isp.includes("Google"))          return "Google Cloud Bot";
  if (isp.includes("Amazon"))          return "AWS Bot";
  if (isp.includes("Facebook") || isp.includes("Meta")) return "Meta / Facebook Bot";

  return "Unknown Bot / Crawler";
}

// ─── Route ───────────────────────────────────────────────────────────────────

router.post("/", async (req, res) => {
  try {
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, BASE_TELEGRAM_URL } = process.env;

    const { payload } = req.body;
    const decryptedJson = decryptText(payload);
    const {
      vname, vsourceLabel, utmCampaign, utmMedium,
      country_name, city, region,
      ip, isp, timezone, latitude, longitude,
      timestamp, referral, device, os, browser, screen, page,
    } = JSON.parse(decryptedJson);

    const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const visitorType = detectVisitorType({ isp, browser });

    // ── Bot Message ──
    if (visitorType !== "human") {
      const botSource = detectBotSource({ isp, browser });
      const isSuspicious = visitorType === "suspicious";

      const botMessage = [
        isSuspicious
          ? `👁️ <b>Suspicious Visit — Likely Bot</b>`
          : `🤖 <b>Bot Detected</b>`,
        ``,
        `🔍 <b>Probable Source:</b> ${botSource}`,
        `🌐 <b>IP Address:</b> <code>${ip}</code>`,
        isp ? `🏢 <b>ISP:</b> ${isp}` : null,
        `🌍 <b>Location:</b> ${city}, ${region}, ${country_name}`,
        `🕑 <b>Time (IST):</b> ${timestamp}`,
        page ? `📄 <b>Page:</b> ${page}` : null,
        ``,
        isSuspicious
          ? `<i>💡 Tip: If this is Microsoft/LinkedIn, a real visitor likely clicked your portfolio link on LinkedIn just now.</i>`
          : `<i>This is an automated crawler, not a real visitor.</i>`,
      ]
        .filter(Boolean)
        .join("\n");

      await axios.post(`${BASE_TELEGRAM_URL}/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: botMessage,
        parse_mode: "HTML",
      });

      return res.status(200).send("Tracked");
    }

    // ── Human Message (your original) ──
    const message = [
      `👀 <b>You've Got a Visitor!</b>`,
      ``,
      `👤 <b>Visitor:</b> ${vname || "Anonymous"}`,
      `📌 <b>Source:</b> ${vsourceLabel || "🔖 Direct"}`,
      utmCampaign ? `🎯 <b>Campaign:</b> ${utmCampaign}` : null,
      utmMedium   ? `📡 <b>Medium:</b> ${utmMedium}`     : null,
      referral && referral !== "Direct" ? `🔗 <b>Referrer:</b> ${referral}` : null,
      ``,
      `🌍 <b>Location:</b> ${city}, ${region}, ${country_name}`,
      `🌐 <b>IP Address:</b> <code>${ip}</code>`,
      isp      ? `🏢 <b>ISP:</b> ${isp}`           : null,
      timezone ? `🕐 <b>Timezone:</b> ${timezone}` : null,
      `🗺️ <b>Map:</b> <a href="${mapLink}">Open in Google Maps</a>`,
      ``,
      `${device === "Mobile" ? "📱" : "🖥️"} <b>Device:</b> ${device}`,
      `💻 <b>OS:</b> ${os}`,
      `🌐 <b>Browser:</b> ${browser}`,
      screen ? `📐 <b>Screen:</b> ${screen}` : null,
      ``,
      `🕑 <b>Time (IST):</b> ${timestamp}`,
      page ? `📄 <b>Page:</b> ${page}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    await axios.post(`${BASE_TELEGRAM_URL}/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML",
    });

    res.status(200).send("Tracked");
  } catch (err) {
    console.error("Tracking failed:", err);
    res.status(500).send("Error");
  }
});

export default router;
// import axios from "axios";
// import express from "express";
// import { decryptText } from "../utils/crypto.js";

// const router = express.Router();

// router.post("/", async (req, res) => {
//   try {
//     const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, BASE_TELEGRAM_URL } = process.env;
//     const { payload } = req.body;

//     const decryptedJson = decryptText(payload);
//     const {
//       vname,
//       vsourceLabel,
//       utmCampaign,
//       utmMedium,
//       country_name,
//       city,
//       region,
//       ip,
//       isp,
//       timezone,
//       latitude,
//       longitude,
//       timestamp,
//       referral,
//       device,
//       os,
//       browser,
//       screen,
//       page,
//     } = JSON.parse(decryptedJson);

//     const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

//     const message = [
//       `👀 <b>You've Got a Visitor!</b>`,
//       ``,
//       `👤 <b>Visitor:</b> ${vname || "Anonymous"}`,
//       `📌 <b>Source:</b> ${vsourceLabel || "🔖 Direct"}`,
//       utmCampaign ? `🎯 <b>Campaign:</b> ${utmCampaign}` : null,
//       utmMedium   ? `📡 <b>Medium:</b> ${utmMedium}`     : null,
//       referral && referral !== "Direct"
//         ? `🔗 <b>Referrer:</b> ${referral}`
//         : null,
//       ``,
//       `🌍 <b>Location:</b> ${city}, ${region}, ${country_name}`,
//       `🌐 <b>IP Address:</b> <code>${ip}</code>`,
//       isp      ? `🏢 <b>ISP:</b> ${isp}`           : null,
//       timezone ? `🕐 <b>Timezone:</b> ${timezone}` : null,
//       `🗺️ <b>Map:</b> <a href="${mapLink}">Open in Google Maps</a>`,
//       ``,
//       `${device === "Mobile" ? "📱" : "🖥️"} <b>Device:</b> ${device}`,
//       `💻 <b>OS:</b> ${os}`,
//       `🌐 <b>Browser:</b> ${browser}`,
//       screen ? `📐 <b>Screen:</b> ${screen}` : null,
//       ``,
//       `🕑 <b>Time (IST):</b> ${timestamp}`,
//       page   ? `📄 <b>Page:</b> ${page}`     : null,
//     ]
//       .filter(Boolean)
//       .join("\n");

//     await axios.post(
//       `${BASE_TELEGRAM_URL}/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
//       {
//         chat_id: TELEGRAM_CHAT_ID,
//         text: message,
//         parse_mode: "HTML",
//       }
//     );

//     res.status(200).send("Tracked");
//   } catch (err) {
//     console.error("Tracking failed:", err);
//     res.status(500).send("Error");
//   }
// });

// export default router;
