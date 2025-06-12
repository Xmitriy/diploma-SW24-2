import cors from "cors";

const allowedOrigins = ["*"];

const corsConfig = cors({
  methods: ["GET", "POST", "PUT", "DELETE"],
  maxAge: 600,
  credentials: true,
  origin: allowedOrigins,
});

export default corsConfig;
