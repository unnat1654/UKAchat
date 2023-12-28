import { cloudinary } from "../config/cloudinary.js";
import { hashPassword, verifyPassword } from "../helpers/authHelpers.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";
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
      res.status(404).send({ success: false, message: "Username is required" });
    }
    if (!email) {
      res.status(404).send({ success: false, message: "Email is required" });
    }
    if (!password) {
      res.status(404).send({ success: false, message: "Password is required" });
    }
    if (!first_name) {
      res
        .status(404)
        .send({ success: false, message: "First Name is required" });
    }
    if (!last_name) {
      res
        .status(404)
        .send({ success: false, message: "Last name is required" });
    }
    if (!DOB) {
      res
        .status(404)
        .send({ success: false, message: "Date of Birth is required" });
    }
    if (!phone) {
      res
        .status(404)
        .send({ success: false, message: "phone Number is required" });
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
    //hashing password
    const hashedPassword = hashPassword(password);

    const existingUser = await userModel.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "User already exists, please login.",
      });
    }
    const user = new userModel({
      username,
      email,
      password: hashedPassword,
      name: { first_name, last_name },
      last_name,
      DOB,
      phone,
      photo: { secure_url: secureUrl, public_id: publicId },
    });
    await user.save();
    res.status(201).send({
      success: true,
      message: "Registered Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
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
      res.status(404).send({ success: false, message: "Email is required" });
    }
    if (!password) {
      res.status(404).send({ success: false, message: "Password is required" });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      res.status(404).send({
        success: false,
        message: "user not found",
      });
    }
    if (verifyPassword(password, user.password)) {
      const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(200).send({
        success: true,
        message: "User logged in successfully.",
        user: {
          email: user.email,
          first_name: user.name.first_name,
          last_name: user.name.last_name,
          status: user.status,
          DOB: user.DOB,
          photo: user.photo.secure_url,
        },
        token,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Entered email or password incorrect.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
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
      res.status(404).send({ success: false, message: "Email is required" });
    }
    if (!new_password) {
      res.status(404).send({ success: false, message: "Password is required" });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      res.status(404).send({
        success: false,
        message: "user not found",
      });
    }
    const hashedPassword = hashPassword(new_password);
    await userModel.findByIdAndUpdate(
      user._id,
      { password: hashedPassword },
      { runValidators: true }
    );
    res.status(200).send({
      success: true,
      message: "password changed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while updating password",
    });
  }
};
