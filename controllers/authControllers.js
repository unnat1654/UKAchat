import { cloudinary } from "../server.js";
import { hashPassword, verifyPassword } from "../helpers/authHelpers.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";
import queryCache from "../helpers/queryCacheHelpers.js";
import { sendEmailVerificationMail, sendPasswordResetMail } from "../helpers/mailHelpers.js";
//POST    /signup
export const signUpController = async (req, res) => {
  try {
    //from post requests
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      DOB,
      phone,
      photo,
    } = req.body;

    //cloudinary return values
    let publicId;
    let secureUrl;

    //checking User Entries
    if (!username) {
      return res
        .status(404)
        .send({ success: false, message: "Username is required" });
    }
    if (!email) {
      return res
        .status(404)
        .send({ success: false, message: "Email is required" });
    }
    if (!password) {
      return res
        .status(404)
        .send({ success: false, message: "Password is required" });
    }
    if (!first_name) {
      return res
        .status(404)
        .send({ success: false, message: "First Name is required" });
    }
    if (!last_name) {
      return res
        .status(404)
        .send({ success: false, message: "Last name is required" });
    }
    if (!DOB) {
      return res
        .status(404)
        .send({ success: false, message: "Date of Birth is required" });
    }
    if (!phone) {
      return res
        .status(404)
        .send({ success: false, message: "Phone Number is required" });
    }

    let existingUser = await queryCache.get(
      `userModel-findOne:${email},${phone}`
    );
    if (!existingUser) {
      existingUser = await userModel
        .findOne({
          $or: [{ email }, { phone }],
        })
        .select("_id password");
      await queryCache.set(
        `userModel-findOne:${email},${phone}`,
        existingUser,
        600
      );
      await queryCache.set(`userModel-findOne:${email}`, existingUser, 600);
    }

    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "User already exists, please login.",
      });
    }

    if (photo) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        photo,
        {
          folder: "profile",
        }
      );
      publicId = public_id;
      secureUrl = secure_url;
    }
    const mailStatus = await sendEmailVerificationMail(email);
    if (!mailStatus.success) {
      return res.status(500).send({
        success: false,
        message: "Error while sending verfication email, try again"
      })
    }
    const user = new userModel({
      username,
      email,
      password: hashPassword(password),
      name: { first_name, last_name },
      DOB,
      phone,
      ...(publicId && {
        photo: { secure_url: secureUrl, public_id: publicId },
      }),
    });
    await user.save();

    res.status(201).send({
      success: true,
      message: "Registered Successfully, Please verify your Email...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while signing up.",
      error,
    });
  }
};

//GET     /verify-email/:token
export const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(404).send({
        success: true, message: "token missing"
      })
    }
    const decode = JWT.verify(token, process.env.HELPER_JWT_SECRET);
    console.log(decode);
    if (!decode.email) {
      return res.status(403).send({
        success: false,
        message: "Access Forbidden"
      });
    }
    await userModel.findOneAndUpdate(
      {email:decode.email},
      { verified: true },
      { runValidators: true }
    );
    res.status(200).send({
      success: true, message: "Email verified"
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while verifying email"
    });
  }
};


//POST    /login
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res
        .status(404)
        .send({ success: false, message: "Email is required" });
    }
    if (!password) {
      return res
        .status(404)
        .send({ success: false, message: "Password is required" });
    }

    let user = await queryCache.get(`userModel-findOne:${email}`);
    if (!user) {
      user = await userModel
        .findOne({ email })
        .select("_id username name DOB photo verified password");
      await queryCache.set(`userModel-findOne:${email}`, user, 30);
    }
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not found",
      });
    }
    if (!user.verified) {
      return res.status(403).send({
        success: false,
        message: "user not verified"
      })
    }
    if (!verifyPassword(password, user.password)) {
      return res.status(404).send({
        success: false,
        message: "Entered email or password incorrect.",
      });
    }
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.status(200).send({
      success: true,
      message: "User logged in successfully.",
      user: {
        email: user.email,
        username: user.username,
        first_name: user.name.first_name,
        last_name: user.name.last_name,
        DOB: user.DOB,
        photo: user.photo.secure_url,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while logging in",
      error,
    });
  }
};

//PATCH     /forgot-password
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, new_password } = req.body;
    if (!email) {
      return res
        .status(404)
        .send({ success: false, message: "Email is required" });
    }
    if (!new_password) {
      return res
        .status(404)
        .send({ success: false, message: "Password is required" });
    }
    let user = await queryCache.get(`userModel-findOne:${email}`);
    if (!user) {
      user = await userModel.findOne({ email });
      await queryCache.set(`userModel-findOne:${email}`, user);
    }
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not found",
      });
    }
    const hashedPassword = hashPassword(new_password);
    const sentMail = await sendPasswordResetMail(email, user._id, hashedPassword);
    if (!sentMail.success) {
      return res.status(500).send({
        success: false,
        message: "Error while sending mail"
      });
    }
    res.status(200).send({
      success: true,
      message: "Reset password mail sent successfully"
    })
    return
  } catch (error) {
    res.status(500).send({
      success:false,
      message:"Error while sending password reset mail"
    })
  }
};

//GET /reset-password/:token
export const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(404).send({
        success: false,
        message: "Token missing"
      });
    }
    const { _id, password } = JWT.verify(token, process.env.HELPER_JWT_SECRET);
    if (!_id || !password) {
      res.status(403).send({
        success: false,
        message: "Access Forbidden"
      });
    }
    const user = await userModel.findByIdAndUpdate(
      _id,
      { password },
      { runValidators: true, new: true }
    );
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }
    return res.status(200).send({
      success: true,
      message: "password changed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while updating password",
    });
  }
}