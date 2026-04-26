const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hrId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  salary: { type: Number, required: true }, // Net Salary
  ctc: { type: Number, required: true },
  bonus: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  taxableIncome: { type: Number, required: true },
  totalTax: { type: Number, required: true },
  taxRegime: { type: String, enum: ['new', 'old'], default: 'new' },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  basicSalary: { type: Number, default: 0 },
  hra: { type: Number, default: 0 },
  allowances: { type: Number, default: 0 },
  dearnessAllowance: { type: Number, default: 0 },
  convenienceAllowance: { type: Number, default: 0 },
  medicalAllowance: { type: Number, default: 0 },
  specialAllowance: { type: Number, default: 0 },
  epf: { type: Number, default: 0 },
  professionalTax: { type: Number, default: 0 },
  sec80c: { type: Number, default: 0 },
  homeLoan: { type: Number, default: 0 },
  taxCess: { type: Number, default: 0 },
  paidDays: { type: Number, default: 30 },
  workedDays: { type: Number, default: 30 },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Payroll", payrollSchema);
