import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,           // ex: smtp.gmail.com
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,         // ex: no-reply@ahauros.io
    pass: process.env.SMTP_PASS          // App password (din PayAiX secrets)
  }
});

export async function sendMail(to, subject, text, html) {
  return transporter.sendMail({
    from: `"Ahauros AI" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html
  });
}
