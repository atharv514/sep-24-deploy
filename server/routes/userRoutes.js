const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const authMiddleware = require("../middlewares/authMiddleware");

const bcrypt = require("bcrypt");

const userRouter = express.Router(); 

userRouter.post("/register", async (req, res) => {
  console.log("req received", req.body);
  // api/users/register
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.send({ success: false, message: "User already exists" });
    }
    const saltRounds = 10; // the higher the number, the more secure and slower  the hashing process
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    console.log("hashedPassword", hashedPassword);

    const newUser = new User({
      ...req.body, // spread operator
      password: hashedPassword,
    });

    // const newUser = new User(req.body); // create a new user document
    await newUser.save(); // save the document to the database

    res.send({
      success: true,
      message: "Registration Successful, Please Login",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

async function hashPassword(password) {
  console.time("time taken");
  const salt = await bcrypt.genSalt(14);
  console.log("salt", salt);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log("hashedPassword", hashedPassword);
  console.timeEnd("time taken");
  console.log("******************");
  return hashPassword;
}

userRouter.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.send({
        success: false,
        message: "User not found, Please register",
      });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.send({ success: false, message: "Invalid Password" });
    }

    // if (req.body.password !== user.password) {
    //   return res.send({ success: false, message: "Invalid Password" });
    // }
    const password = "Ayush@123";
    hashPassword(password);
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    // console.log("token", token);
    res.send({ success: true, message: "Login Successful", data: token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

userRouter.get("/get-current-user", authMiddleware, async (req, res) => {
  console.log("proceesing request");
  try {
    const user = await User.findById(req.body.userId).select("-password");
    res.send({
      success: true,
      data: user,
      message: "You are authorized to go to the protected route",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// otp generator






module.exports = userRouter;