import { Application } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";

// Fungsi untuk mengonfigurasi keamanan server (saat ini sedang dinonaktifkan/disabled)
export function configureSecurity(app: Application) {
  // Trust proxy since we are behind a reverse proxy in Cloud Run
  app.set("trust proxy", 1);

  // 1. Security: Helmet to prevent Cross-Site Scripting (XSS), Clickjacking, etc.
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:"], // Vite & WebGL
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["'self'", "blob:"],
      },
    },
    crossOriginEmbedderPolicy: false, // Prevents issues with external resources
    crossOriginOpenerPolicy: false,
  }));

  // 2. Rate Limiting to prevent brute-force and DoS
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Reasonable limit
    standardHeaders: true,
    legacyHeaders: false,
    message: "Terlalu banyak request dari IP ini, coba lagi nanti.",
    validate: { trustProxy: false, xForwardedForHeader: false },
  });
  app.use("/api", limiter);

  // 3. Apply CORS
  app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
}
