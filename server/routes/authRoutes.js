import express from "express";
import {
  forgotPasswordController,
  loginController,
  resetPasswordController,
  signUpController,
  updatePhotoController,
  verifyEmailController,
} from "../controllers/authControllers.js";
import { isLoggedIn } from "../middlewares/authMiddlewares.js";

const router = express.Router();

//router test
router.get("/hello", (req, res) => {
  res.send({ hello: "World" });
});

//singup route
router.post("/signup", signUpController);

//login route
router.post("/login", loginController);

//verify email route
router.get("/verify-email/:token",verifyEmailController);

//forgot password route
router.patch("/forgot-password", forgotPasswordController);

//reset password route
router.get("/reset-password/:token",resetPasswordController);

//update photo route
router.patch("/update-photo", isLoggedIn, updatePhotoController);

export default router;
