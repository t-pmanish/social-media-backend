const mongoose = require("mongoose");

const dataBaseConnection = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected To DATABASE (MONGODB)");
  } catch (error) {
    console.log("Failed To Connect With DATABASE", error);
    process.exit(1);
  }
};

module.exports = {
  dataBaseConnection,
};
