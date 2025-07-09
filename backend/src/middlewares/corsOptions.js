import "dotenv/config";
import cors from "cors";

const rawOrigins = process.env.CORS_ALLOWED_ORIGINS || "";
const whitelist = rawOrigins
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests without Origin (Postman, cURL)
    if (!origin) return callback(null, true);
    if (whitelist.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin not allowed ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-agent-secret"],
  credentials: true,
  maxAge: 600,
};

export default cors(corsOptions);
