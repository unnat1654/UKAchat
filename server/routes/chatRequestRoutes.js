import { Router } from "express";
import { isLoggedIn } from "../middlewares/authMiddlewares.js";
import {
  handleRequestController,
  sendRequestController,
  showRequestsController,
  generateQrInviteController,
  qrAcceptController,
} from "../controllers/chatRequestController.js";

const router = Router();

//send invite to connect
router.post("/send-request", isLoggedIn, sendRequestController);

//show invites sent to user
router.get("/show-requests", isLoggedIn, showRequestsController);

// handle click of accept and decline invites and create room accordingly
router.post("/handle-request", isLoggedIn, handleRequestController);

//generate qr invite
router.post("/generate-qr-invite", isLoggedIn, generateQrInviteController);

//accept qr invite
router.post("/qr-accept", isLoggedIn, qrAcceptController);

export default router;
