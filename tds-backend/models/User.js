const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { 
    type: String, 
    unique: true, 
    required: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  employeeId: { type: String, unique: true },
  pan: { type: String, default: 'NOT SET' },
  designation: { type: String, default: 'Employee' },
  department: { type: String, default: 'General' },
  location: { type: String, default: 'Not Set' },
  bankName: { type: String, default: 'Not Set' },
  bankAccountNo: { type: String, default: 'Not Set' },
  password: { type: String, required: true },
  role: { type: String, enum: ['HR', 'EMPLOYEE'], default: 'EMPLOYEE' },
  status: { type: String, enum: ['Active', 'Blocked'], default: 'Active' },
  taxRegime: { type: String, enum: ['OLD', 'NEW'], default: 'NEW' },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: String, default: 'System' },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("User", userSchema);