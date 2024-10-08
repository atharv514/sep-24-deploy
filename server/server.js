const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const path=require("path");
const cors = require("cors");
const app = express();


app.use(cors({
  origin:"*",
  methods:["GET","POST","PUT","DELETE"],
  allowedHeaders:["Content-Type","Authorization"]
}));
const clientBuildPath = path.join(__dirname, "../client/build");
console.log("clientBuildPath", clientBuildPath);
app.use(express.static(clientBuildPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
})
app.use(express.json());
app.use(helmet());
app.use(mongoSanitize());
require("dotenv").config(); // load the environment variables into process.env

const userRouter = require("./routes/userRoutes");
const movieRouter = require("./routes/movieRoutes");
const theatreRouter = require("./routes/theatreRoutes");
const showRouter = require("./routes/showRoutes");
const bookingRouter = require("./routes/bookingRoutes");

const connectDb = require("./config/db");
connectDb();

/** * Routes */
app.use((req, res, next) => {
  console.log("request received on server", req.body, req.url);
  next();
});
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// apply rate limiter to all API requests
app.use("/api/", apiLimiter);

app.use("/api/users", userRouter);
app.use("/api/movies", movieRouter);
app.use("/api/theatres", theatreRouter);
app.use("/api/shows", showRouter);
app.use("/api/bookings", bookingRouter);

app.listen(8082, () => {
  console.log("Server is up and running on port 8082");
});