import express from "express";
import {
  forgotPasswordController,
  loginController,
  resetPasswordController,
  signUpController,
  verifyEmailController,
} from "../controllers/authControllers.js";

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

export default router;
