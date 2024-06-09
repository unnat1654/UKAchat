import { createServer } from "http";
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import colors from "colors";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import chatRequestRoutes from "./routes/chatRequestRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import connectDB from "./config/db_config.js";
import { socketModule } from "./config/socket_config.js";
import socketEvents from "./controllers/socketController.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "x5fsdgeq3",
  api_key: "853227874578895",
  api_secret: "VT-1D4Vsrfbz66d_rJNE_yZ6wLA",
});

export {cloudinary};


//configure env
dotenv.config();

//rest object
const app = express();
const httpServer = createServer(app);

//middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })
);

//connecting to database
connectDB();

//connect to socket
socketModule.init(httpServer);
socketEvents();

//Welcome
app.get("/home", (req, res) => {
  res.send({
    message: "Welcome to UKACHAT server",
  });
});

//routes
app.use("/api/v0/auth", authRoutes);
app.use("/api/v0/contact", contactRoutes);
app.use("/api/v0/message", messageRoutes);
app.use("/api/v0/request", chatRequestRoutes);
app.use("/api/v0/group", groupRoutes);

//port
const PORT = process.env.PORT || 8080;

//run listen
httpServer.listen(PORT, () => {
  console.log(
    `Server running on port ${process.env.PORT} in ${process.env.DEV_MODE}`
      .bgCyan.white
  );
});
