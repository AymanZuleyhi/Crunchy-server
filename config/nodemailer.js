import nodemailer from "nodemailer";
import axios from "axios";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.sendinblue.com",
  port: 465,
  secure: true,
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = async ({ to, subject, text }) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: process.env.SENDER_EMAIL, name: "Crunchy" },
        to: [{ email: to }],
        subject: subject,
        textContent: text,
      },
      {
        headers: {
          "api-key": process.env.SMTP_PASSWORD, // Your Brevo Master Password is your API Key
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { transporter, sendEmail };
