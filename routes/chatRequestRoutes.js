import { Router } from "express";
import { isLoggedIn } from "../middlewares/authMiddlewares.js";
import {
  handleRequestController,
  sendRequestController,
  showRequestsController,
} from "../controllers/chatRequestController.js";

const router = Router();

//send invite to connect
router.post("/send-request", isLoggedIn, sendRequestController);

//show invites sent to user
router.get("/show-requests", isLoggedIn, showRequestsController);

// handle click of accept and decline invites and create room accordingly
router.post("/handle-request", isLoggedIn, handleRequestController);

export default router;
