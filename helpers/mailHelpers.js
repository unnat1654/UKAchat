
import JWT from "jsonwebtoken";
import dotenv from "dotenv";
import { createTransport } from "nodemailer";


dotenv.config();
const transporter = createTransport({
  service: "gmail",
  host: "smtp.gmail.com.",
  auth: {
    user: process.env.MAILER_EMAIL,
    pass: process.env.MAILER_PASSWORD,
  },
});

export const sendEmailVerificationMail = async (eMail) => {
    const token = JWT.sign({ email:eMail }, process.env.HELPER_JWT_SECRET);
    const link=`http://localhost:8080/api/v0/auth/verify-email/${token}`;
    const mailOptions = {
        from: {
            name: "UKAchat",
            address: process.env.MAILER_EMAIL,
        },
        to: eMail,
        subject: "Verification of provided E-mail",
        text: `This mail contains verification link:${link}`,
        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">UKA Chat</a>
        </div>
        <p style="font-size:1.1em">Hi,</p>
        <p>Click the verification link to verify your e-mail address and resume application usage.</p>
        <a href="${link}" style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">Verify</a>
        <p style="font-size:0.9em;">Regards,<br />UKA chat</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>Unnat Kumar Agarwal and Amish Soni,</p>
          <p>IIT Noida</p>
        </div>
      </div>
    </div>`,
    };
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                resolve({success:false});
                console.log(error);
            }
            else {
                resolve({success:true});
            }
        });
    });
};

export const sendPasswordResetMail = async (eMail,_id,hashedPassword) => {
    const token = JWT.sign({ _id,password:hashedPassword }, process.env.HELPER_JWT_SECRET);
    const link=`http://localhost:8080/api/v0/auth/reset-password/${token}`;
    const mailOptions = {
        from: {
            name: "UKAchat",
            address: process.env.MAILER_EMAIL,
        },
        to: eMail,
        subject: "Password Reset Request Email",
        text: `This mail contains Reset password link:${link}`,
        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">UKA Chat</a>
        </div>
        <p style="font-size:1.1em">Hi,</p>
        <p>Click the verification link to reset your password and resume application usage.</p>
        <a href="${link}" style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">Verify</a>
        <p style="font-size:0.9em;">Regards,<br />UKA chat</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>Unnat Kumar Agarwal and Amish Soni,</p>
          <p>IIT Noida</p>
        </div>
      </div>
    </div>`,
    }
    console.log(transporter);
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                resolve({success:false});
                console.log(error);
            }
            else {
                resolve({success:true});
            }
        })
    })

};