import { Application } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";

// Fungsi untuk mengonfigurasi keamanan server (saat ini sedang dinonaktifkan/disabled)
export function configureSecurity(app: Application) {
  /*
  // 1. Security: Helmet to prevent Cross-Site Scripting (XSS), Clickjacking, and other vulnerabilities.
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Vite requires eval & inline for HMR
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://upload.wikimedia.org"],
        connectSrc: ["'self'", "ws:", "wss:"], // WebSockets for hot reload
      },
    },
    // Cross-Origin Resource Policy (CORP) to prevent hot-linking / cross-origin resource embedding
    crossOriginResourcePolicy: { policy: "same-origin" }
  }));

  // 2. Rate Limiting to prevent brute-force and DoS
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
    message: "Terlalu banyak request dari IP ini, coba lagi nanti.",
  });
  app.use("/api", limiter);

  // 3. Secure CORS against Cross-Origin attacks
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? (process.env.FRONTEND_URL || '*') : '*', // Adjust in prod
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  */
}
