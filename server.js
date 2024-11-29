const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.MONGODB_URI;
const PORT = process.env.PORT || 8000;

mongoose.set("strictQuery", true);
mongoose.connect(DB).then(() => console.log("DB connect successfully"));

app.listen(PORT, () => {
  console.log(`listening in port ${PORT}`);
});
