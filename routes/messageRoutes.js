import { Router } from "express";
import { isLoggedIn } from "../middlewares/authMiddlewares.js";
import {
  getLastMessageController,
  getMessagesController,
  saveBulkMessagesController,
  sendMessageController,
} from "../controllers/messageController.js";

const router = Router();

//save messages in conversations
router.post("/save-backup-messages", isLoggedIn, saveBulkMessagesController);

//send offline Message
router.post("/send-message-api",isLoggedIn,sendMessageController);

//get last message from a contact
router.get("/get-last-message/:cid", isLoggedIn, getLastMessageController);

//get 200 messages in a batch from a contact
router.get("/get-messages/:room/:page", isLoggedIn, getMessagesController);

export default router;
