import express from "express";

const app = express();

app.get("/health", (req, res) => {
  res.json({ message: "hello" });
});

export { app };

export default app;
