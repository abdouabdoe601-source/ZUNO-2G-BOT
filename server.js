const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const BOT_NAME = "𝑍𝑈𝑁𝑂 2ğ";

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "DjazzyBot2026";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

// الصفحة الرئيسية
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

// إرسال رسالة إلى Messenger
async function sendMessage(senderId, messageText) {
  const response = await fetch(
    `https://graph.facebook.com/v24.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        recipient: {
          id: senderId
        },
        message: {
          text: messageText
        }
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(`[${BOT_NAME}] Messenger error:`, data);
    throw new Error("Messenger Send API failed");
  }

  console.log(`[${BOT_NAME}] Message sent`);
  return data;
}

// عقل ZUNO
async function askZuno(userMessage) {
  const response = await openai.responses.create({
    model: "gpt-5.6-luna",
    instructions: `
أنت 𝑍𝑈𝑁𝑂 2ğ، مساعد ذكي لطلاب البكالوريا في الجزائر، خاصة شعبة آداب وفلسفة.

مهمتك:
- شرح الدروس بطريقة بسيطة وواضحة.
- مساعدة الطالب في الفلسفة والمقالات والمنهجية.
- مساعدة الطالب في العربية.
- شرح التاريخ والجغرافيا.
- حل التمارين وشرح خطوات الحل.
- مساعدة الطالب في تنظيم المراجعة.
- إذا كان السؤال خارج الدراسة، أجب باختصار وارجع بلطف إلى دورك كمساعد للبكالوريا.

أسلوبك:
- تكلم بدارجة جزائرية بسيطة عندما يناسب السؤال.
- استعمل العربية الفصحى في الشروحات الدراسية عندما تكون أوضح.
- كن واضحا ومباشرا.
- لا تدّعي امتلاك معلومات غير مؤكدة.
- لا تقل إنك أستاذ أو جهة رسمية.
- لا تعطِ إجابات طويلة بلا حاجة.
- استعمل عناوين وإيموجيات بشكل خفيف ومنظم.

ابدأ من السؤال الذي أرسله الطالب.
`,
    input: userMessage
  });

  return response.output_text;
}

// استقبال أحداث Messenger
app.post("/webhook", async (req, res) => {
  const body = req.body;

  console.log(`[${BOT_NAME}] Webhook event received`);

  if (body.object !== "page") {
    return res.sendStatus(404);
  }

  // نجاوب Facebook بسرعة
  res.status(200).send("EVENT_RECEIVED");

  try {
    for (const entry of body.entry || []) {
      for (const event of entry.messaging || []) {

        // تجاهل الرسائل غير النصية حاليا
        if (!event.message?.text) {
          continue;
        }

        const senderId = event.sender?.id;
        const userMessage = event.message.text.trim();

        if (!senderId || !userMessage) {
          continue;
        }

        console.log(
          `[${BOT_NAME}] Message from ${senderId}: ${userMessage}`
        );

        // إرسال السؤال إلى OpenAI
        const answer = await askZuno(userMessage);

        // إرسال الجواب للمستخدم
        await sendMessage(senderId, answer);
      }
    }
  } catch (error) {
    console.error(`[${BOT_NAME}] ERROR:`, error);

    // نحاول إرسال رسالة خطأ بسيطة للمستخدم إذا كان senderId متاحا
  }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `${BOT_NAME} السيستام يشتغل بنجاح على PORT ${PORT}`
  );
});
