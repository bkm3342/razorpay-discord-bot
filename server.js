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

// ✅ Create QR Code API
app.post("/create-qr", async (req, res) => {
  try {
    const { amount, currency } = req.body;

    // 1. Create an order
    const order = await razorpay.orders.create({
      amount: amount * 100, // convert to paise
      currency: currency || "INR",
      receipt: "receipt_" + Date.now(),
    });

    // 2. Create QR Code for that order
    const qr = await razorpay.qrCodes.create({
      type: "upi_qr",
      name: "Payment QR",
      usage: "single_use",
      amount: order.amount,
      currency: order.currency,
      description: "Scan & Pay",
      close_by: Math.floor(Date.now() / 1000) + 3600, // 1 hr expiry
    });

    res.json({
      order_id: order.id,
      qr_code: qr.image_url, // ye URL frontend ya Discord me embed karke dikha sakte ho
    });
  } catch (err) {
    console.error("❌ QR Create Error:", err);
    res.status(500).json({ error: "Failed to create QR" });
  }
});

// ✅ Webhook endpoint
app.post("/razorpay-webhook", async (req, res) => {
  const payload = req.body;
  console.log("💰 Payment Event:", payload);

  if (payload.event === "payment.captured") {
    const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
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
