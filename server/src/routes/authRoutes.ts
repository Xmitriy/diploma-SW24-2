import express from "express";
import auth from "@/controllers/auth.controller";
import { body } from "express-validator";
import { authenticate } from "@/controllers/token";
import multer from "multer";

const app = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const validateUser = [
  body("username").exists(),
  body("email").isEmail().withMessage("Invalid email"),
  body("password").exists().isLength({ min: 8 }),
];

app.post("/login", auth.login);
app.post("/register", validateUser, auth.register);
app.put("/update", authenticate, upload.single("image"), auth.update);
app.post("/refresh", auth.generateNewToken);
app.post("/google", auth.google);
app.get("/authorize", auth.authorize);
app.get("/callback", auth.callback);
app.post("/logout", auth.logout);
app.get("/food", authenticate, auth.food);
app.post("/food/image", authenticate, upload.single("image"), auth.foodImage);
app.get("/exercise", authenticate, auth.exercise);

export default app;
