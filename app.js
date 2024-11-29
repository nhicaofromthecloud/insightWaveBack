const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const requireAuth = require("./middleware/auth");

const authRouter = require("./routes/authRouter");
const usersRouter = require("./routes/usersRouter");
const customersRouter = require("./routes/customersRouter");
const reviewsRouter = require("./routes/reviewsRouter");
const appscriptRouter = require("./routes/appscriptRouter");

const AppError = require("./utils/AppError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

// { credentials: true, origin: "http://192.168.100.117" }
app.use(cors({ origin: true, credentials: false }));
app.use(express.json());

// Public routes

app.use("/api/appscript", appscriptRouter);
app.use("/", authRouter);

// Protected routes - Apply requireAuth middleware
app.use("/api", requireAuth);

// Protected route definitions
app.use("/api/user", usersRouter);
app.use("/api/customer", customersRouter);

app.use("/api/review", reviewsRouter);

app.all("*", (req, res, next) => {
  next(
    new AppError(`this route ${req.originalUrl} doesn't exist on server`, 404),
  );
});

app.use(globalErrorHandler);

module.exports = app;
