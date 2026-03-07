const nodemailer = require("nodemailer");

//* Initialize Cached Transporter
let cachedTransporter = null;

//* Function to get Transporter
function getTransporter() {
  //* Return if a Transporter is cached
  if (cachedTransporter) return cachedTransporter;

  //* Get ENV Variables
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASSWORD,
  } = process.env;

  //* Check if ENV Variables are available
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    throw new Error("Missing SMTP env vars (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS).");
  }

  //* Create a Chached Transporter
  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });

  //* Return Cached Transporter
  return cachedTransporter;
}

//* Function to send an EMail with given Arguments
async function sendMail({ to, subject, text, html, replyTo }) {
  //* Check if necessary Arguments are given
  if (!to) throw new Error("sendMail: 'to' is required");
  if (!subject) throw new Error("sendMail: 'subject' is required");
  if (!text && !html) throw new Error("sendMail: 'text' or 'html' is required");

  //* Set From Name and EMail
  const fromName = process.env.MAIL_FROM_NAME || "System";
  const fromEmail = process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER;

  //* Gets Transporter for EMail
  const transporter = getTransporter();

  //* Sends EMail
  return transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    text,
    html,
    replyTo,
  });
}

module.exports = { sendMail };