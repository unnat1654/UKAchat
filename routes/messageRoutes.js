import { Router } from "express";
import { isLoggedIn } from "../middlewares/authMiddlewares.js";
import {
  getLastMessageController,
  getMessagesController,
  saveMessagesController,
} from "../controllers/messageController.js";

const router = Router();

//save messages in conversations
router.post("/save-messages", isLoggedIn, saveMessagesController);

//get last message from a contact
router.get("/get-last-message/:room", isLoggedIn, getLastMessageController);

//get 200 messages in a batch from a contact
router.get("/get-messages/:room/:page", isLoggedIn, getMessagesController);

export default router;
