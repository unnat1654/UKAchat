
export const sendEmailVerificationMail = async (eMail, _id) => {
    const mailOptions = {
        from: {
            name: "UKAchat",
            address: process.env.MAILER_EMAIL,
        },
        to: eMail,
        subject: "Verification of provided E-mail",
        text: "This mail contains verification link:",
        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Zealicon</a>
        </div>
        <p style="font-size:1.1em">Hi,</p>
        <p>Use the following OTP to complete your Sign Up procedures. OTP is valid for 10 minutes</p>
        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
        <p style="font-size:0.9em;">Regards,<br />Team Zealicon</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>Tech Team Zealicon</p>
          <p>JSS Academy of Technical Education, Sector 62</p>
          <p>Noida</p>
        </div>
      </div>
    </div>`,
    }
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject({success:false});
            }
            else {
                resolve({success:true});
            }
        })
    })

};
