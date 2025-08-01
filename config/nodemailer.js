import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: "587",
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendEmail = async ({ from, to, subject, text }) => {
  await transporter.sendMail({
    from,
    to,
    subject,
    text,
  });
};

export { transporter, sendEmail };
