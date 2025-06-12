import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
  headers: true, // Include rate limit headers in response
});

export default limiter;
