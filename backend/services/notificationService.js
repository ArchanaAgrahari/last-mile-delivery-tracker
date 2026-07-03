import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendStatusEmail = async (toEmail, orderId, status) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: toEmail,
      subject: `Order ${orderId} - Status Update: ${status}`,
      text: `Your order ${orderId} status has been updated to: ${status}`,
    });
  } catch (error) {
    console.error("Email sending failed:", error.message);
  }
};