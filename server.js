import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";

// Routes
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import recipeRouter from "./routes/recipeRouter.js";
import newsFeedRouter from "./routes/newsFeedRouter.js";

// Create the app
const app = express();
const port = 4000;
// process.env.PORT || 4000;
// If the port is not available use 4000.
connectDB();

// Configure CORS with credentials and specific origin
app.use(
  cors({
    origin: "https://aymanzuleyhi.github.io", // Replace with your frontend's origin
    credentials: true,
  })
);

// Make the app use: json, cookies, and cors.
app.use(express.json());
app.use(cookieParser());

// Send a response.
app.get("/", (req, res) => res.send("The server is working."));
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/recipe", recipeRouter);
app.use("/news-feed", newsFeedRouter);

app.listen(port, () => console.log("The server is working."));
