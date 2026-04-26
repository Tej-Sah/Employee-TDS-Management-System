const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("./models/User");
const Payroll = require("./models/Payroll");
const Settings = require("./models/Settings");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// API Test route
app.get("/api/test", (req, res) => {
  res.send("TDS Backend Running 🚀");
});

app.get("/api/reports/individual-payslip/:id", async (req, res) => {
    console.log("Individual Payslip request for ID:", req.params.id);
    try {
        const p = await Payroll.findById(req.params.id).populate("userId");
        if (!p) return res.status(404).send("Payroll record not found");

        const doc = new PDFDocument({ 
            size: 'A4', 
            margin: 20,
            info: { Title: `Payslip - ${p.userId?.name || 'Employee'}`, Author: 'TDS Portal' }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=payslip_${p.userId?.employeeId || 'download'}.pdf`);

        doc.pipe(res);
        drawDetailedPayslip(doc, p);
        doc.end();

    } catch (error) {
        console.error("Individual Report Error:", error);
        res.status(500).send("Failed to generate individual report");
    }
});

// System Health API
app.get("/api/system/health", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    
    res.json({
      status: dbStatus === "Connected" ? "Healthy" : "Degraded",
      database: dbStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
});

// Signup API
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, role, createdBy } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });
    
    // 📧 Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate Unique Employee ID
    const userCount = await User.countDocuments();
    const employeeId = `EMP${String(userCount + 1).padStart(4, "0")}`;

    const newUser = new User({ 
      name: name || "User", 
      email, 
      employeeId,
      pan: req.body.pan || 'NOT SET',
      designation: req.body.designation || 'Employee',
      password: hashedPassword, 
      role: role || "EMPLOYEE",
      createdBy: createdBy || "System"
    });
    await newUser.save();
    res.status(201).json({ 
        message: "User registered successfully ✅", 
        user: { 
            id: newUser._id, 
            email: newUser.email,
            employeeId: newUser.employeeId
        } 
    });
  } catch (error) { res.status(500).json({ message: "Server error" }); }
});

// Login API
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    console.log("Login Attempt:", user.email, "Role:", user.role);

    res.status(200).json({ message: "Login successful ✅", user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { 
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" }); 
  }
});

// Users API
app.get("/api/users", async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 10 } = req.query;
    const query = { isDeleted: false };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);

    res.json({
      users: users.map(u => ({ ...u.toObject(), id: u._id })),
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) { res.status(500).json({ message: "Server error" }); }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid user ID format" });
    }
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ ...user.toObject(), id: user._id });
  } catch (error) { res.status(500).json({ message: "Server error" }); }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.isDeleted = true;
    await user.save();
    
    res.json({ message: "User soft-deleted successfully" });
  } catch (error) { res.status(500).json({ message: "Server error" }); }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, role, password, status, pan, designation, department, location, bankName, bankAccountNo, taxRegime } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;
    if (taxRegime) user.taxRegime = taxRegime;
    if (pan) user.pan = pan;
    if (designation) user.designation = designation;
    if (department) user.department = department;
    if (location) user.location = location;
    if (bankName) user.bankName = bankName;
    if (bankAccountNo) user.bankAccountNo = bankAccountNo;

    // Only update and hash password if a new one is provided
    if (password && password.trim().length > 0) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ ...userResponse, id: user._id });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Stats API
app.get("/api/stats", async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: "EMPLOYEE", isDeleted: false });
    const totalHRs = await User.countDocuments({ role: "HR", isDeleted: false });
    
    const activeUsers = await User.countDocuments({ status: "Active", isDeleted: false });
    const blockedUsers = await User.countDocuments({ status: "Blocked", isDeleted: false });
    
    const payrollStats = await Payroll.aggregate([
      { $match: { isDeleted: false } },
      { 
        $group: { 
          _id: null, 
          totalSalary: { $sum: "$salary" },
          totalTds: { $sum: "$totalTax" }
        } 
      }
    ]);

    const monthlyGrowth = await User.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({ 
      totalEmployees, 
      totalHRs, 
      activeUsers, 
      blockedUsers,
      totalSalary: payrollStats[0]?.totalSalary || 0,
      totalTds: payrollStats[0]?.totalTds || 0,
      pendingFilings: blockedUsers, // Mocking pending filings as blocked users for now
      monthlyGrowth
    });
  } catch (error) { res.status(500).json({ message: "Server error" }); }
});

// Payroll API
app.get("/api/payroll", async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { isDeleted: false };
    if (month) query.month = month;
    if (year) query.year = parseInt(year);

    const payrolls = await Payroll.find(query)
      .populate("userId", "name email employeeId department location bankName bankAccountNo designation")
      .sort({ createdAt: -1 });
    res.json(payrolls);
  } catch (error) { res.status(500).json({ message: "Server error" }); }
});

app.post("/api/payroll", async (req, res) => {
  try {
    const { 
        userId, salary, bonus, deductions, month, year, hrId, ctc, 
        taxableIncome, totalTax, taxRegime, paidDays,
        basicSalary, hra, allowances, sec80c, homeLoan, taxCess,
        convenienceAllowance, medicalAllowance, specialAllowance, epf, workedDays,
        dearnessAllowance, professionalTax
    } = req.body;

    if (!userId || !hrId) {
        return res.status(400).json({ message: "UserId and hrId are required" });
    }
    
    // Create new payroll entry
    const payrollData = {
      userId: new mongoose.Types.ObjectId(userId),
      hrId: new mongoose.Types.ObjectId(hrId),
      salary,
      ctc,
      bonus,
      deductions,
      taxableIncome,
      totalTax,
      taxRegime,
      month,
      year,
      paidDays: paidDays || 30,
      basicSalary: basicSalary || 0,
      hra: hra || 0,
      allowances: allowances || 0,
      dearnessAllowance: dearnessAllowance || 0,
      convenienceAllowance: convenienceAllowance || 0,
      medicalAllowance: medicalAllowance || 0,
      specialAllowance: specialAllowance || 0,
      epf: epf || 0,
      professionalTax: professionalTax || 0,
      sec80c: sec80c || 0,
      homeLoan: homeLoan || 0,
      taxCess: taxCess || 0,
      workedDays: workedDays || (paidDays || 30)
    };

    const payroll = new Payroll(payrollData);
    await payroll.save();
    console.log("Payroll saved successfully for:", userId);

    res.status(201).json(payroll);
    
  } catch (error) { 
    console.error("Payroll Save Error Detailed:", error);
    res.status(500).json({ message: "Server error", error: error.message }); 
  }
});

// Helper function for reusable high-fidelity payslip drawing
const drawDetailedPayslip = (doc, p) => {
    const drawBox = (x, y, w, h) => doc.rect(x, y, w, h).stroke();
    const drawLine = (x1, y1, x2, y2) => doc.moveTo(x1, y1).lineTo(x2, y2).stroke();

    // 0. Page Border
    doc.rect(20, 20, 555, 780).stroke('#006600'); // Professional Green Border like GeeksforGeeks
    
    // 1. Header Box
    doc.lineWidth(1.5);
    drawBox(40, 40, 515, 60);
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#000000').text("Company Name", 40, 55, { align: 'center', width: 515 });
    
    // 2. Subtitle Box
    drawBox(40, 100, 515, 30);
    doc.fontSize(14).text(`Salary Slip of ${p.month || 'Month'} ${p.year || '2026'}`, 40, 108, { align: 'center', width: 515 });

    // 3. Employee Info Box
    drawBox(40, 130, 515, 80);
    doc.fontSize(10).font('Helvetica-Bold');
    
    const infoY = 140;
    doc.text("Name", 50, infoY);
    doc.text("Designation", 50, infoY + 20);
    doc.text("Location", 50, infoY + 40);
    doc.text("Department", 300, infoY);
    doc.text("Bank Name", 300, infoY + 20);
    doc.text("Bank Account No.", 300, infoY + 40);

    doc.font('Helvetica');
    doc.text(`:  ${p.name || p.userId?.name || 'N/A'}`, 135, infoY);
    doc.text(`:  ${p.designation || p.userId?.designation || 'N/A'}`, 135, infoY + 20);
    doc.text(`:  ${p.location || p.userId?.location || 'N/A'}`, 135, infoY + 40);
    doc.text(`:  ${p.department || p.userId?.department || 'N/A'}`, 405, infoY);
    doc.text(`:  ${p.bankName || p.userId?.bankName || 'N/A'}`, 405, infoY + 20);
    doc.text(`:  ${p.bankAccountNo || p.userId?.bankAccountNo || 'N/A'}`, 405, infoY + 40);

    // 4. Tables Header
    const tableTop = 220;
    const tableH = 180;
    drawBox(40, tableTop, 257, tableH); 
    drawBox(297, tableTop, 258, tableH); 
    
    drawLine(85, tableTop + 20, 85, tableTop + tableH); 
    drawLine(200, tableTop + 20, 200, tableTop + tableH); 
    drawLine(342, tableTop + 20, 342, tableTop + tableH); 
    drawLine(457, tableTop + 20, 457, tableTop + tableH); 

    doc.rect(40, tableTop, 257, 20).fill('#f1f5f9').stroke('#000000');
    doc.rect(297, tableTop, 258, 20).fill('#f1f5f9').stroke('#000000');
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10);
    doc.text("Earnings", 40, tableTop + 5, { align: 'center', width: 257 });
    doc.text("Deductions", 298, tableTop + 5, { align: 'center', width: 258 });

    const subHeaderY = tableTop + 20;
    doc.rect(40, subHeaderY, 257, 20).stroke();
    doc.rect(297, subHeaderY, 258, 20).stroke();
    doc.fontSize(9);
    doc.text("Serial No.", 43, subHeaderY + 5);
    doc.text("Salary Head", 90, subHeaderY + 5);
    doc.text("Amount (₹)", 205, subHeaderY + 5);
    doc.text("Serial No.", 300, subHeaderY + 5);
    doc.text("Salary Head", 347, subHeaderY + 5);
    doc.text("Amount (₹)", 462, subHeaderY + 5);

    doc.font('Helvetica');
    const rowStart = subHeaderY + 20;
    const rowH = 18;
    
    // Ensure we show MONTHLY values on the payslip
    const monthlyGross = (p.ctc || 0) / 12;
    const basicMonthly = (p.basicSalary || (p.ctc ? (p.ctc * 0.5) : 0)) / 12;
    const hraMonthly = (p.hra || (p.ctc ? (p.ctc * 0.2) : 0)) / 12;
    const daMonthly = (p.dearnessAllowance || 0) / 12;
    const convMonthly = (p.convenienceAllowance || 0) / 12;
    const medMonthly = (p.medicalAllowance || 0) / 12;
    
    // Calculated balancing figure for Special Allowance to ensure total matches Gross
    const balanceSpecial = Math.max(0, monthlyGross - (basicMonthly + hraMonthly + daMonthly + convMonthly + medMonthly));

    const earnings = [
        { id: 1, label: "Basic", val: basicMonthly },
        { id: 2, label: "Dearness Allowance", val: daMonthly },
        { id: 3, label: "House Rent Allowance", val: hraMonthly },
        { id: 4, label: "Conveyance Allowance", val: convMonthly },
        { id: 5, label: "Medical Allowance", val: medMonthly },
        { id: 6, label: "Special Allowance", val: balanceSpecial }
    ];
    const deductions = [
        { id: 1, label: "Professional Tax", val: (p.professionalTax || 0) / 12 },
        { id: 2, label: "Tax Deducted at Source", val: p.deductions || 0 }, // TDS stored as monthly already
        { id: 3, label: "Employee Provident Fund", val: (p.epf || 0) / 12 }
    ];

    earnings.forEach((item, i) => {
        const y = rowStart + (i * rowH);
        doc.text(String(item.id), 43, y + 5, { width: 40, align: 'center' });
        doc.text(item.label, 90, y + 5);
        doc.text(Math.floor(item.val).toLocaleString(), 205, y + 5, { width: 45, align: 'right' });
        drawLine(40, y + rowH, 297, y + rowH);
    });
    deductions.forEach((item, i) => {
        const y = rowStart + (i * rowH);
        doc.text(String(item.id), 300, y + 5, { width: 40, align: 'center' });
        doc.text(item.label, 347, y + 5);
        doc.text(Math.floor(item.val).toLocaleString(), 462, y + 5, { width: 45, align: 'right' });
        drawLine(297, y + rowH, 555, y + rowH);
    });

    const footerTop = tableTop + tableH + 10;
    const fmt = (n) => Math.floor(n).toLocaleString();
    
    drawBox(40, footerTop, 180, 40);
    drawLine(140, footerTop, 140, footerTop + 40);
    doc.font('Helvetica-Bold').fontSize(9).text("SALARY (GROSS)/ PM", 45, footerTop + 15);
    doc.text(fmt((p.ctc || 0)/12), 145, footerTop + 15);

    doc.text("Reimbursement", 45, footerTop + 45);

    drawBox(40, footerTop + 55, 180, 40);
    drawLine(140, footerTop + 55, 140, footerTop + 95);
    doc.text("SALARY (CTC)/ PM", 45, footerTop + 70);
    doc.text(fmt((p.ctc || 0)/12), 145, footerTop + 70);

    drawBox(40, footerTop + 100, 180, 40);
    drawLine(140, footerTop + 100, 140, footerTop + 140);
    doc.fontSize(10).text("NET SALARY", 45, footerTop + 115);
    doc.text(fmt(p.salary), 145, footerTop + 115);

    drawBox(40, footerTop + 145, 180, 40);
    drawLine(140, footerTop + 145, 140, footerTop + 185);
    doc.fontSize(9).text("TOTAL NUMBER OF DAYS", 45, footerTop + 160);
    doc.text(String(p.workedDays || 30), 145, footerTop + 160);

    const rightBoxX = 297;
    drawBox(rightBoxX, footerTop + 55, 258, 40);
    drawLine(rightBoxX + 160, footerTop + 55, rightBoxX + 160, footerTop + 95);
    doc.text("TOTAL DEDUCTION", rightBoxX + 10, footerTop + 70);
    const totalDed = (p.professionalTax || 0) / 12 + (p.deductions || 0) + (p.epf || 0) / 12;
    doc.text(fmt(totalDed), rightBoxX + 170, footerTop + 70);
};

app.post("/api/reports/payslip", async (req, res) => {
  try {
    const p = req.body; 
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    res.header("Content-Type", "application/pdf");
    res.attachment(`salary_slip_${p.name || 'employee'}.pdf`);
    doc.pipe(res);
    drawDetailedPayslip(doc, p);
    doc.end();
  } catch (error) { 
    console.error("Payslip Gen Error:", error);
    res.status(500).json({ message: "Failed to generate payslip" }); 
  }
});

// Form 16 Data API
app.get("/api/reports/form16/:userId", async (req, res) => {
  try {
    const { year } = req.query;
    const userId = req.params.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch all payrolls to build history and current view
    const allPayrolls = await Payroll.find({ userId, isDeleted: false }).sort({ year: -1, month: -1 });
    const availableYears = [...new Set(allPayrolls.map(p => p.year))].sort((a,b) => b-a);

    // Determine target year
    const targetYear = year ? parseInt(year) : (availableYears[0] || new Date().getFullYear());
    const yearlyRecords = allPayrolls.filter(p => p.year === targetYear);

    // Aggregate by Quarters for Part A
    const quarters = {
      Q1: { label: "Q1 (Apr-Jun)", paid: 0, tax: 0, deposited: 0, receipt: "CCCAA" + Math.random().toString(36).substring(7).toUpperCase() },
      Q2: { label: "Q2 (Jul-Sep)", paid: 0, tax: 0, deposited: 0, receipt: "CCCAA" + Math.random().toString(36).substring(7).toUpperCase() },
      Q3: { label: "Q3 (Oct-Dec)", paid: 0, tax: 0, deposited: 0, receipt: "CCCAA" + Math.random().toString(36).substring(7).toUpperCase() },
      Q4: { label: "Q4 (Jan-Mar)", paid: 0, tax: 0, deposited: 0, receipt: "CCCAA" + Math.random().toString(36).substring(7).toUpperCase() }
    };

    const mapping = {
      'April': 'Q1', 'May': 'Q1', 'June': 'Q1',
      'July': 'Q2', 'August': 'Q2', 'September': 'Q2',
      'October': 'Q3', 'November': 'Q3', 'December': 'Q3',
      'January': 'Q4', 'February': 'Q4', 'March': 'Q4'
    };

    yearlyRecords.forEach(p => {
      const q = mapping[p.month];
      if (q) {
        quarters[q].paid += p.ctc || 0;
        quarters[q].tax += p.totalTax || 0;
        quarters[q].deposited += p.totalTax || 0;
      }
    });

    const settings = await Settings.findOne();
    const latestPayroll = yearlyRecords.length > 0 ? yearlyRecords[0] : {};

    res.json({
      user,
      targetYear,
      availableYears,
      quarters,
      payroll: latestPayroll,
      company: settings || {}
    });
  } catch (error) {
    console.error("Form 16 API Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/payroll/user/:userId", async (req, res) => {
  try {
    const payrolls = await Payroll.find({ userId: req.params.userId, isDeleted: false }).sort({ year: -1, month: -1 });
    res.json(payrolls);
  } catch (error) { res.status(500).json({ message: "Server error" }); }
});




// Reports API (PDF)
const PDFDocument = require("pdfkit");

app.get("/api/reports/payroll", async (req, res) => {
  try {
    const { month, year, format } = req.query;
    const query = { isDeleted: false };
    if (month) query.month = month;
    if (year) query.year = parseInt(year);

    const payrolls = await Payroll.find(query).populate("userId", "name email employeeId department location bankName bankAccountNo designation");
    const data = payrolls.map(p => ({
      Employee: p.userId?.name || "N/A",
      Email: p.userId?.email || "N/A",
      Salary: p.salary,
      Bonus: p.bonus,
      Deductions: p.deductions,
      Total: p.salary + p.bonus - p.deductions,
      Month: p.month,
      Year: p.year
    }));

    if (format === "pdf") {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      res.header("Content-Type", "application/pdf");
      res.attachment(`payroll_report_${month || 'All'}_${year || '2026'}.pdf`);
      doc.pipe(res);

      if (!payrolls || payrolls.length === 0) {
        doc.fontSize(20).text("Comprehensive Payroll Report", { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text("No payroll records found for the selected period.", { align: 'center' });
        doc.end();
        return;
      }

      payrolls.forEach((p, index) => {
        if (index > 0) doc.addPage();
        drawDetailedPayslip(doc, p);
      });

      doc.end();
      return;
    }

    res.json(data);
  } catch (error) { res.status(500).json({ message: "Server error" }); }
});


// Settings API
app.get("/api/settings", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ siteName: "TDS Portal" });
      await settings.save();
    }
    res.json(settings);
  } catch (error) { res.status(500).json({ message: "Server error" }); }
});

app.put("/api/settings", async (req, res) => {
  try {
    const { siteName, hrId, tan, companyPan, companyAddress } = req.body;
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    
    settings.siteName = siteName;
    settings.tan = tan || settings.tan;
    settings.companyPan = companyPan || settings.companyPan;
    settings.companyAddress = companyAddress || settings.companyAddress;
    settings.updatedBy = hrId;
    settings.updatedAt = Date.now();
    
    await settings.save();
    
    res.json(settings);
  } catch (error) { res.status(500).json({ message: "Server error" }); }
});

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Catch-all route for any non-API routes to serve index.html (useful for SPA)
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// MongoDB connection and Start server
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5001;

    mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected ✅");
    
    // Migration: Populate employeeId for existing users
    const usersWithoutId = await User.find({ 
        $or: [
            { employeeId: { $exists: false } },
            { employeeId: null },
            { employeeId: "" }
        ]
    }).sort({ createdAt: 1 });

    if (usersWithoutId.length > 0) {
        console.log(`Found ${usersWithoutId.length} users without employeeId. Starting migration...`);
        let existingCount = await User.countDocuments({ employeeId: { $ne: null, $ne: "" } });
        for (let i = 0; i < usersWithoutId.length; i++) {
            usersWithoutId[i].employeeId = `EMP${String(existingCount + i + 1).padStart(4, "0")}`;
            await usersWithoutId[i].save();
        }
        console.log("Migration complete! All users now have a unique employeeId.");
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 TDS Portal is running!`);
      console.log(`🔗 Local link: http://localhost:${PORT}\n`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Failed ❌", err);
  });
