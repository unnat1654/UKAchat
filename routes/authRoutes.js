import express from "express";
import {
  forgotPasswordController,
  loginController,
  signUpController,
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

//forgot password route
router.patch("/forgot-password", forgotPasswordController);

export default router;
