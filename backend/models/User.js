const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ================= PERSONAL INFORMATION =================

    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    // ================= USER ROLE =================

    role: {
      type: String,
      enum: ["rider", "driver"],
      required: true,
    },

    // ================= DRIVER INFORMATION =================

    licenceNumber: {
      type: String,
      required: function () {
        return this.role === "driver";
      },
    },

    vehicleMake: {
      type: String,
      required: function () {
        return this.role === "driver";
      },
    },

    vehicleModel: {
      type: String,
      required: function () {
        return this.role === "driver";
      },
    },

    registrationNumber: {
      type: String,
      required: function () {
        return this.role === "driver";
      },
    },

    availableSeats: {
      type: Number,
      required: function () {
        return this.role === "driver";
      },
    },
  },
  {
    timestamps: true,
  },
);

// ================= USER MODEL =================

const User = mongoose.model("User", userSchema);

module.exports = User;
