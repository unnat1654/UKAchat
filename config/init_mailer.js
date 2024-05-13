import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILER_EMAIL,
    pass: process.env.MAILER_PASS,
  },
});

export const sendMail = async ({ to, subject, text, html }) => {
  try {
    await transporter.sendMail({
      from: {
        name: "UKAchat",
        address: process.env.MAILER_EMAIL,
      },
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.log(error);
  }
};