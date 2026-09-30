const express = require("express");

const app = express();
app.use(express.json());

const BOT_NAME = "𝑍𝑈𝑁𝑂 2ğ";
const VERIFY_TOKEN = "DjazzyBot2026";

// اختبار بسيط للسيرفر
app.get("/", (req, res) => {
  res.status(200).send(`${BOT_NAME} is online`);
});

// تحقق Facebook Webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log(`[${BOT_NAME}] WEBHOOK_VERIFIED`);
    return res.status(200).send(challenge);
  }

  console.log(`[${BOT_NAME}] WEBHOOK_VERIFICATION_FAILED`);
  return res.sendStatus(403);
});

// استقبال أحداث Messenger
app.post("/webhook", (req, res) => {
  const body = req.body;

  console.log(`[${BOT_NAME}] Webhook event received`);

  if (body.object === "page") {
    for (const entry of body.entry || []) {
      for (const event of entry.messaging || []) {
        if (event.message?.text) {
          const senderId = event.sender?.id;
          const text = event.message.text.trim();

          console.log(
            `[${BOT_NAME}] Message from ${senderId}: ${text}`
          );
        }
      }
    }

    return res.status(200).send("EVENT_RECEIVED");
  }

  return res.sendStatus(404);
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`${BOT_NAME} السيستام يشتغل بنجاح على PORT ${PORT}`);
});
