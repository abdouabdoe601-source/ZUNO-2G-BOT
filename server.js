const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json());

// هوية البوت والأمان
const BOT_NAME = "𝑍𝑈𝑁𝑂 2ğ";
const VERIFY_TOKEN = "DjazzyBot2026"; 

// 1. كود التحقق والربط مع فيسبوك (Webhook Verification)
app.get('/webhook', (req, res) => {
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log(`[${BOT_NAME}] WEBHOOK_VERIFIED`);
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);      
    }
  }
});

// 2. سيستام استقبال الرسائل والردود التلقائية
app.post('/webhook', (req, res) => {  
  let body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(function(entry) {
      let messaging_events = entry.messaging;
      
      messaging_events.forEach(function(event) {
        let sender_id = event.sender.id; 
        
        if (event.message && event.message.text) {
          let user_text = event.message.text.trim();
          console.log(`[${BOT_NAME}] رسالة من ${sender_id}: ${user_text}`);
          
          // سيتم تفعيل الربط مع Firebase هنا فور الحصول على الرابط الفعال
        }
      });
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.listen(process.env.PORT || 3000, () => console.log(`${BOT_NAME} السيستام يشتغل بنجاح...`));
