const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const app = express().use(bodyParser.json());

// هوية البوت والأمان
const BOT_NAME = "𝑍𝑈𝑁𝑂 2ğ";
const VERIFY_TOKEN = "DjazzyBot2026"; 

// الاتصال بقاعدة بيانات تطبيق جازي (DZ Connect)
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://firebaseio.com"
  });
}

const db = admin.database();

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
        let sender_id = event.sender.id; // آيدي حساب الزبون على فيسبوك
        
        if (event.message && event.message.text) {
          let user_text = event.message.text.trim();
          console.log(`[${BOT_NAME}] رسالة من ${sender_id}: ${user_text}`);
          
          // نظام فحص المدخلات: إذا أرسل الزبون رقم هاتف جزائري صحيح
          if (/^(05|06|07)\d{8}\$/.test(user_text)) {
            
            // إرسال الرقم إلى واجهة Firebase ليتلقاه تطبيق الهاتف وينفذه
            db.ref('orders/' + sender_id).set({
              phone: user_text,
              action: "request_2g", // العرض المطلوب
              status: "pending",     // حالة الطلب في الانتظار
              timestamp: Date.now()
            }).then(() => {
              console.log(`[${BOT_NAME}] تم حفظ طلب الرقم ${user_text} في Firebase.`);
              // هنا مستقبلاً يرسل السيرفر رسالة مسنجر للزبون: "تم استلام طلبك وجاري تفعيل عرض الـ 2G"
            }).catch((error) => {
              console.error("خطأ في قاعدة البيانات:", error);
            });

          } else {
            // رد السيرفر الافتراضي إذا أرسل الزبون كلمة عادية وليس رقم هاتف
            console.log(`[${BOT_NAME}] رسالة ترحيبية أو أمر غير مفهوم.`);
            // هنا مستقبلاً يرسل له البوت قائمة الأزرار والعروض ليختار منها
          }
        }
      });
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.listen(process.env.PORT || 3000, () => console.log(`${BOT_NAME} السيستام يشتغل بنجاح...`));
