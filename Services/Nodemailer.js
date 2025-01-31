import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

//Function to send mail to reset password using a third party package Node Mailer
export const sendLink = async (email, token, userId) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.PASSMAIL,
      pass: process.env.PASSKEY,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.PASSMAIL,
      to: email,
      subject: "Reset Password",
      text: `http://localhost:5173/resetpassword/${userId}/${token}`,
      html: `<p>A request is made to reset your password. If it is made by you click the following link to proceed: <a href="http://localhost:5173/resetpassword/${userId}/${token}">Reset Password</a>. If it is not done by you, ignore the mail.</p>`,
    });
    console.log("Mail Sent Successfully", info);
  } catch (error) {
    console.log(error.message);
    console.log("Internal Server Error Unable to Sent Mail");
  }
};
