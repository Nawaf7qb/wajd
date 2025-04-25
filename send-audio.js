const fetch = require('node-fetch');
const FormData = require('form-data');

exports.handler = async function(event) {
  const webhookURL = process.env.WEBHOOK_URL;
  const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
  // Handle status JSON
  if (contentType.includes('application/json')) {
    await fetch(webhookURL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: event.body });
    return { statusCode: 200, body: 'OK' };
  }
  // Handle audio Base64
  const params = event.queryStringParameters || {};
  const word = params.word || 'غير محددة';
  const buffer = Buffer.from(event.body, 'base64');
  const form = new FormData();
  form.append('file', buffer, 'voice.webm');
  form.append('payload_json', JSON.stringify({ content: `الكلمة المطلوبة: ${word}\nنتيجة القراءة: قيد التقييم.` }));
  await fetch(webhookURL, { method: 'POST', body: form });
  return { statusCode: 200, body: 'OK' };
};