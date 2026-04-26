const mongoose = require("mongoose");
const User = require("../models/User");

const URI = "mongodb+srv://tdsUser:Anish123@cluster0.xlhgkou.mongodb.net/tds?retryWrites=true&w=majority";

async function diag() {
    try {
        await mongoose.connect(URI);
        console.log("Connected to DB");
        const users = await User.find({ isDeleted: false });
        console.log("Total Users:", users.length);
        users.forEach(u => {
            console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, taxRegime: ${u.taxRegime}`);
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

diag();
