<div align="center">

<!-- Animated Header Wave Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:062c26,50:059669,100:10b981&height=220&section=header&text=Employee%20TDS%20%26%20Payroll%20System%20💼&fontSize=38&fontColor=ffffff&animation=fadeIn&fontAlignY=36&desc=Enterprise%20Tax%20Deduction%2C%20Regime%20Calculation%20%26%20Payslip%20Automation&descAlignY=58&descSize=17" alt="Employee TDS Banner" width="100%"/>

<!-- Animated Typing Subtitle -->
<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=3000&pause=800&color=10B981&center=true&vCenter=true&width=1000&height=50&lines=Enterprise+Employee+Payroll+%26+Tax+Deduction+at+Source+(TDS)+Platform;Automated+Old+vs+New+Tax+Regime+Bracket+Calculation+%26+Cess;Full-Stack+Node.js%2FExpress+5+%26+MongoDB+with+JWT+Authentication;Dynamic+PDF+Payslip+Generation+(PDFKit)+%26+Bulk+CSV+Exporting+%F0%9F%9A%80" alt="TDS Typing SVG" />

<br>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express 5"/>
  <img src="https://img.shields.io/badge/MongoDB-Mongoose_8-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
  <img src="https://img.shields.io/badge/PDF_Engine-PDFKit-E0234E?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" alt="PDFKit"/>
  <img src="https://img.shields.io/badge/Security-bcryptjs-555555?style=for-the-badge" alt="bcrypt"/>
</p>

<!-- Live Operational Indicators -->
<p align="center">
  <img src="https://img.shields.io/badge/Tax_Engine-Old_%26_New_Regime-10B981?style=flat-square&logo=calculator&logoColor=white"/>
  <img src="https://img.shields.io/badge/Payslip_Format-Direct_PDF_Download-0284C7?style=flat-square&logo=adobe&logoColor=white"/>
  <img src="https://img.shields.io/badge/RBAC-HR_Manager_%7C_Employee_Portal-8B5CF6?style=flat-square&logo=auth0&logoColor=white"/>
  <img src="https://img.shields.io/badge/Compliance-Sec_80C_%7C_EPF_%7C_Cess-F59E0B?style=flat-square"/>
</p>

<p align="center">
  <b>A comprehensive FinTech payroll and tax management platform built to automate Tax Deducted at Source (TDS), salary disbursements, statutory exemptions (80C, EPF, HRA), and dynamic PDF payslip rendering.</b>
</p>

</div>

---

### ⚡ Live Payroll & TDS Calculation Simulation

<div align="center">

<!-- Animated Interactive Payroll Terminal -->
<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=15&duration=4200&pause=1200&color=10B981&background=0D1117&center=false&vCenter=true&width=860&height=125&lines=%24+curl+-X+POST+http%3A%2F%2Flocalhost%3A5000%2Fapi%2Fpayroll%2Fcalculate+-d+'%7B%22ctc%22%3A1200000%2C%22regime%22%3A%22new%22%7D';%7B%22grossMonthly%22%3A100000%2C%22taxableIncome%22%3A925000%2C%22tdsMonthly%22%3A4125%2C%22netPay%22%3A95875%7D;%F0%9F%93%84+Streaming+PDFKit+Payslip+Document+for+Employee+%23EMP-2026-104...;%E2%9C%85+payslip_EMP104.pdf+Generated+with+Statutory+80C+%26+EPF+Breakdowns!" alt="Terminal Payroll Simulation"/>

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Core Features](#-core-features)
- [Tax Engine & Statutory Compliance](#-tax-engine--statutory-compliance)
- [REST API Specifications](#-rest-api-specifications)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Author & Connect](#-author--connect)

---

## 💡 Overview

Corporate HR departments and payroll specialists spend days calculating monthly **Tax Deducted at Source (TDS)**, evaluating employee exemption submissions, determining tax brackets under conflicting regimes, and distributing monthly payslips.

**Employee TDS Management System** automates this lifecycle:
- **Dual Tax Regime Computation:** Seamlessly calculates tax liabilities comparing the **Old Tax Regime** (with 80C, HRA, and Home Loan exemptions) against the **New Tax Regime** (with standard deductions and revised slab rates).
- **Statutory Breakdown:** Automates salary component allocation (Basic, HRA, DA, Medical, EPF, Professional Tax, and 4% Health & Education Cess).
- **Dynamic PDF Payslip Generation:** Compiles and streams branded, audit-compliant PDF salary slips using **PDFKit**.
- **Role-Based Access Control (RBAC):** Distinct dashboards for HR Managers (payroll generation, employee records, bulk analytics) and Employees (payslip history, tax statements).
- **Audit & Analytics:** Real-time system diagnostics endpoint (`/api/system/health`) and CSV data export capabilities using **json2csv**.

---

## 🏛 System Architecture

The application is structured into a modular MVC-style architecture backed by Express 5 and MongoDB:

```mermaid
flowchart TD
    subgraph Client ["Client Interface Layer"]
        HR["HR Manager Portal\n(hr-dashboard.html)"]
        EMP["Employee Self-Service\n(dashboard.html / payroll.html)"]
        AuthUI["Login & Signup UI\n(login.html / signup.html)"]
    end

    subgraph Security ["Security & Middleware"]
        JWT["Stateless JWT Token Verification"]
        BCrypt["bcryptjs Password Hashing"]
        CORS["CORS Policy Middleware"]
    end

    subgraph Server ["Express 5 REST API Layer"]
        Router["Express API Router\n(server.js)"]
        TaxCalc["Tax & TDS Slabs Engine\n(Old vs New Regime)"]
        PDFGen["PDFKit Document Builder\n(individual-payslip.pdf)"]
        CSVExp["json2csv Reporter"]
    end

    subgraph Database ["Persistence Layer"]
        Mongoose["Mongoose 8 ODM"]
        U_M[("User Schema\n(Role: HR / Employee)")]
        P_M[("Payroll Schema\n(CTC, Allowances, TDS)")]
        S_M[("Settings Schema")]
    end

    HR & EMP & AuthUI -->|HTTP / JSON| Security
    Security --> Router
    Router --> TaxCalc
    Router --> PDFGen
    Router --> CSVExp
    Router --> Mongoose
    Mongoose --> U_M & P_M & S_M
    PDFGen -->|Stream PDF Attachment| EMP
    CSVExp -->|Export CSV| HR
```

---

## ✨ Core Features

| Feature | Details |
| :--- | :--- |
| 🧮 **Automated TDS Calculation** | Computes monthly and annual income tax liabilities with automatic slab adjustment and 4% tax cess. |
| 🔄 **Old vs New Tax Regimes** | Full support for Section 80C deductions, HRA exemptions, and home loan rebates in Old Regime, plus revised New Regime slabs. |
| 📄 **Dynamic PDF Payslips** | Built-in **PDFKit** rendering engine compiling complete breakdown tables (earnings, deductions, net salary) for instant download. |
| 👥 **Multi-Role Portals** | **HR Dashboard:** Add employees, process monthly payroll, view company tax totals. <br>**Employee Portal:** View salary history and download payslips. |
| 🔐 **Stateless JWT Security** | Secure password storage with **bcryptjs** (salt rounds: 10) and stateless token validation. |
| 📊 **Bulk CSV Reporting** | Streamlines accounting handoffs by exporting monthly payroll ledgers into formatted CSV spreadsheets. |
| 🩺 **System Diagnostics** | Built-in `/api/system/health` reporting live database connection status, memory utilization, and uptime. |

---

## 📊 Tax Engine & Statutory Compliance

The payroll model accounts for complex statutory salary breakdowns:

### 1. Earnings Breakdown
- **Basic Salary:** Base compensation foundation.
- **House Rent Allowance (HRA):** Subject to tax exemption under Sec 10(13A).
- **Dearness Allowance (DA), Medical & Special Allowances:** Fully taxable components.

### 2. Statutory Deductions
- **Employee Provident Fund (EPF):** Deducted and logged for 80C compliance.
- **Professional Tax (PT):** State-mandated deduction.
- **Section 80C Investments:** Life insurance, ELSS, PPF (capped at ₹1,50,000 in Old Regime).
- **Home Loan Interest:** Deductible up to ₹2,00,000 under Section 24(b).
- **Health & Education Cess:** 4% surcharge applied to computed income tax.

---

## 📡 REST API Specifications

### 🔐 Authentication
- `POST /api/auth/signup` – Register employee or HR account (password hashed with bcrypt)
- `POST /api/auth/login` – Authenticate credentials and return JWT bearer token

### 💰 Payroll & Tax
- `GET  /api/payroll/records` – Retrieve all payroll history for HR administrator
- `GET  /api/payroll/my-records` – Retrieve personal salary history for logged-in employee
- `POST /api/payroll/calculate` – Execute live TDS calculation comparing Old vs New tax regimes
- `POST /api/payroll/disburse` – Finalize and record monthly payroll entry

### 📄 Reports & Downloads
- `GET /api/reports/individual-payslip/:id` – Stream auto-generated PDF payslip via PDFKit
- `GET /api/reports/export-csv` – Export corporate payroll records into CSV via json2csv

### 🩺 System Diagnostics
- `GET /api/system/health` – Returns MongoDB connection state, uptime, and memory usage

---

## 📂 Project Structure

```
Employee-TDS-Management-System/
├── tds-backend/
│   ├── server.js              # Express 5 main application & route handlers
│   ├── models/
│   │   ├── User.js            # User authentication schema (Employee/HR roles)
│   │   ├── Payroll.js         # Comprehensive salary & tax deduction schema
│   │   └── Settings.js        # Global company & tax rate configuration
│   ├── public/                # Frontend client application
│   │   ├── index.html         # Portal landing page
│   │   ├── login.html         # Authentication interface
│   │   ├── signup.html        # Registration portal
│   │   ├── hr-dashboard.html  # HR manager payroll administration view
│   │   ├── dashboard.html     # Employee self-service overview
│   │   ├── payroll.html       # Salary ledger and calculation tools
│   │   ├── style.css          # Responsive dashboard styling
│   │   └── script.js          # Client-side API integration & event handling
│   ├── package.json           # Node.js dependencies (Express 5, Mongoose 8, PDFKit)
│   └── .env.example           # Environment template
└── README.md                  # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** `18.x` or higher
- **MongoDB** (Local instance or MongoDB Atlas URI)

### 1. Clone & Set Up

```bash
# Clone repository
git clone https://github.com/anish03-hub/Employee-TDS-Management-System-Tax-Calculation-Employee-Record-Management.git
cd Employee-TDS-Management-System-Tax-Calculation-Employee-Record-Management/tds-backend

# Install dependencies
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:
```ini
PORT=5000
MONGO_URI=mongodb://localhost:27017/tds_management
JWT_SECRET=your_super_secret_jwt_key_here
```

### 3. Launch Server

```bash
# Start backend server
node server.js
```
The server will boot on **`http://localhost:5000`**. Open your browser to access the application.

---

<div align="center">

## 👨‍💻 Author & Connect

**Anish Kumar Sah**  
*Java Developer | Spring Boot & REST APIs | B.Tech CSE @ Symbiosis Institute of Technology, Pune*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Anish%20Kumar%20Sah-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/anishsah)
[![Email](https://img.shields.io/badge/Email-sah42515%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:sah42515@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-anish03--hub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/anish03-hub)

<br>

<!-- Animated Waving Footer Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:10b981,50:059669,100:062c26&height=110&section=footer" alt="Footer Banner" width="100%"/>

<sub>Built with ❤️ using Node.js, Express 5, and MongoDB. Streamlining enterprise payroll and tax compliance.</sub>

</div>
