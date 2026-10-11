import rateLimit from "express-rate-limit";

// Throttles brute-force attempts against login/register endpoints.
export default rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});
