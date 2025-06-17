import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sendNameRoute from "./routes/sendName.js";
import notifyTelegramRoute from "./routes/notifyTelegram.js";
import { verifySecret } from "./middleware/auth.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Secure endpoints with API key middleware
app.use("/api/send-name", verifySecret, sendNameRoute);
app.use("/api/notify-telegram", verifySecret, notifyTelegramRoute);

app.listen(5000, () => {
  console.log("🚀 Backend running on http://localhost:5000");
});
