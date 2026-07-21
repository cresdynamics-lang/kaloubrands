require('dotenv').config();

const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const TO_EMAIL = process.env.TO_EMAIL || 'info@kaloubrands.com';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function buildTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

const transporter = buildTransporter();

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, service, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Name, email, and message are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
  }

  const brief = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || '—'}`,
    `Service: ${service || 'General Inquiry'}`,
    '',
    'Message:',
    message
  ].join('\n');

  if (!transporter) {
    // SMTP not configured yet — log the brief so nothing is lost during development.
    console.log('--- New brief (SMTP not configured) ---\n' + brief + '\n---------------------------------------');
    return res.json({ ok: true, note: 'dev-mode' });
  }

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || `"Kalou Brands Website" <${process.env.SMTP_USER}>`,
      to: TO_EMAIL,
      replyTo: email,
      subject: `New brief from ${name} — ${service || 'General Inquiry'}`,
      text: brief
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('Email send failed:', err.message);
    res.status(502).json({ ok: false, error: 'Could not send your message right now. Please try WhatsApp or call us.' });
  }
});

// Fall back to index.html for any unknown page path (keeps deep links friendly)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Kalou Brands site running at http://localhost:${PORT}`);
  if (!transporter) {
    console.log('SMTP is not configured — contact form briefs will be logged to the console. Copy .env.example to .env to enable email.');
  }
});
