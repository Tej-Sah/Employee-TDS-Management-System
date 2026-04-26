const mongoose = require("mongoose");
require("dotenv").config();
const Settings = require("./models/Settings");

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected");
        
        const settings = await Settings.findOne();
        console.log("Current Settings:", settings);
        console.log("Type of maintenanceMode:", typeof settings?.maintenanceMode);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
