import express from "express";
import authRoutes from "./routes/authRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";
import reviewRoutes from "./routes/reviewRoutes.ts";

const app = express();

app.get("/health", (req, res) => {
  res.json({ message: "hello" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);

export { app };
export default app;
