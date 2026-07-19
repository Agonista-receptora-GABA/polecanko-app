import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";
import reviewRoutes from "./routes/reviewRoutes.ts";
import env, { isTest } from "../env.ts";
import { errorHandler } from "./middleware/errorHandler.ts";

const allowedOrigins = env.ALLOWED_ORIGINS.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("dev", {
    skip: () => isTest(),
  }),
);

app.get("/health", (req, res) => {
  res.json({ message: "hello" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);

app.use(errorHandler);

export { app };
export default app;
