import { Router } from "express";
import { isLoggedIn } from "../middlewares/authMiddlewares.js";
import {
  createGroupController,
  sendGroupMessageController,
  addGroupMemberController,
  removeGroupMemberController,
  leaveGroupController,
  getGroupController,
  getAllGroupsController,
  getGroupMessagesController,
} from "../controllers/groupController.js";

const router = Router();

// create group
router.post("/create-group", isLoggedIn, createGroupController);

// add group member
router.post("/add-group-member", isLoggedIn, addGroupMemberController);

// remove group member
router.post("/remove-group-member", isLoggedIn, removeGroupMemberController);

// leave group
router.post("/leave-group", isLoggedIn, leaveGroupController);

// get single group
router.get("/get-group/:gid", isLoggedIn, getGroupController);

// get all groups
router.get("/get-all-groups", isLoggedIn, getAllGroupsController);

// send group message
router.post("/send-group-message-api", isLoggedIn, sendGroupMessageController);

//get 200 messages in a batch from a group
router.get("/get-group-messages", isLoggedIn, getGroupMessagesController);

export default router;
