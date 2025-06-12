import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: parseInt(process.env.SMTP_PORT as string) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendAuthMail = async (to: string, code: number) => {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: "Fitness App Verification Code",
    html: `<p>Your verification code is: <strong>${code}</strong></p>`,
  });
};
