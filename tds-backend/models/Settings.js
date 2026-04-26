const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: "TDS Portal" },
  tan: { type: String, default: "NOT SET" },
  companyPan: { type: String, default: "NOT SET" },
  companyAddress: { type: String, default: "NOT SET" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Settings", settingsSchema);
