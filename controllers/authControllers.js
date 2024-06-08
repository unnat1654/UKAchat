import { cloudinary } from "../config/cloudinary.js";
import { hashPassword, verifyPassword } from "../helpers/authHelpers.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";
import queryCache from "../helpers/queryCacheHelpers.js";
//signup Controller - Method post
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
      message: "Registered Successfully",
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

//login Controller - Method post
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
        .select("_id username name DOB photo password");
      await queryCache.set(`userModel-findOne:${email}`);
    }
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not found",
      });
    }
    if (!verifyPassword(password, user.password)) {
      return res.status(404).send({
        success: false,
        message: "Entered email or password incorrect.",
      });
    }
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
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

//Forgot Password Controller - METHOD PATCH
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
    await userModel.findByIdAndUpdate(
      user._id,
      { password: hashPassword(new_password) },
      { runValidators: true }
    );
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
};
