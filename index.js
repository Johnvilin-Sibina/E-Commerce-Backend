import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Database/config.js";
import authRoute from './Routers/authRouter.js';
import userRoute from './Routers/userRouter.js';
import adminRoute from './Routers/adminRouter.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Handle raw body for Stripe webhook
app.post(
  "/api/user/stripe/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    userRoute(req, res, next); // Pass control to userRouter
  }
);

// Apply JSON middleware for all other routes
app.use((req, res, next) => {
  if (req.originalUrl === "/api/user/stripe/webhook") {
    next(); // Skip global middleware for Stripe webhook
  } else {
    express.json()(req, res, next);
  }
});

// app.use(express.json());

connectDB();


app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

//API routes
app.use('/api/auth',authRoute)
app.use('/api/user',userRoute)
app.use('/api/admin',adminRoute)

//Error Handler - middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});


app.listen(process.env.PORT, () => {
  console.log("Server is running");
});
