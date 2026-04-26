const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const Payroll = require("./models/Payroll");

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected");
        
        const userCount = await User.countDocuments();
        console.log("Total Users:", userCount);
        
        const admins = await User.find({ role: 'ADMIN' });
        console.log("Admins:", admins.map(a => ({ id: a._id, name: a.name })));
        
        const latestPayroll = await Payroll.findOne().sort({ createdAt: -1 });
        console.log("Latest Payroll:", latestPayroll);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
