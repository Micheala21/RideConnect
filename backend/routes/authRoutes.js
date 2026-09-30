const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ==================================================
// REGISTER
// ==================================================

router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      role,
      licenceNumber,
      vehicleMake,
      vehicleModel,
      registrationNumber,
      availableSeats,
    } = req.body;

    // Check required information
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      licenceNumber,
      vehicleMake,
      vehicleModel,
      registrationNumber,
      availableSeats,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});
// ==================================================
// LOGIN
// ==================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        licenceNumber: user.licenceNumber,
        vehicleMake: user.vehicleMake,
        vehicleModel: user.vehicleModel,
        registrationNumber: user.registrationNumber,
        availableSeats: user.availableSeats,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================================================
// PROFILE / PROTECTED TEST ROUTE
// ==================================================

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile accessed successfully",
      user,
    });
  } catch (error) {
    console.error("Profile error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================================================
// UPDATE PROFILE
// ==================================================

router.put("/profile", protect, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      vehicleMake,
      vehicleModel,
      registrationNumber,
      availableSeats,
    } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.phoneNumber = phoneNumber;

    if (user.role === "driver") {
      user.vehicleMake = vehicleMake;
      user.vehicleModel = vehicleModel;
      user.registrationNumber = registrationNumber;
      user.availableSeats = availableSeats;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        licenceNumber: user.licenceNumber,
        vehicleMake: user.vehicleMake,
        vehicleModel: user.vehicleModel,
        registrationNumber: user.registrationNumber,
        availableSeats: user.availableSeats,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;
