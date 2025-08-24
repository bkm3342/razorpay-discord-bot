const express = require("express");
const bodyParser = require("body-parser");
const Razorpay = require("razorpay");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(bodyParser.json());

// 🔑 Env variables (Render me set karna hoga)
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID; // jaha message bhejna hai

// Discord bot setup
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Razorpay instance
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Webhook endpoint
app.post("/razorpay-webhook", (req, res) => {
  const payload = req.body;
  console.log("💰 Payment Event:", payload);

  if (payload.event === "payment.captured") {
    const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);
    if (channel) {
      channel.send(`✅ Payment Success: ₹${payload.payload.payment.entity.amount / 100}`);
    }
  }

  res.json({ status: "ok" });
});

// Server listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

client.login(DISCORD_TOKEN);
