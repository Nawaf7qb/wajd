const fetch = require('node-fetch');
const FormData = require('form-data');

// Discord Webhook URL
const WEBHOOK_URL = "https://discord.com/api/webhooks/1365249447151538216/hSASwWLb_cJRrREl1meba1VVWEg5YbwwLU3fXSAMSJgjNT0ih9woItQlx0BwOrKe47Hm";

exports.handler = async function(event) {
  try {
    const params = event.queryStringParameters || {};
    // If JSON status message
    let content = params.content;
    if (params.status === 'true') {
      // event.body contains JSON
      content = JSON.parse(event.body).content;
      await fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
      return { statusCode: 200, body: 'OK' };
    }
    // Else audio upload
    const word = params.word || 'غير محددة';
    const buffer = Buffer.from(event.body, 'base64');
    const form = new FormData();
    form.append('file', buffer, 'voice.webm');
    form.append('payload_json', JSON.stringify({ content: `الكلمة المطلوبة: ${word}\nنتيجة القراءة: قيد التقييم.` }));
    const res = await fetch(WEBHOOK_URL, { method: 'POST', body: form });
    return { statusCode: res.status, body: 'OK' };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Error' };
  }
};