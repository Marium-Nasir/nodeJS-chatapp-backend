const mongoose = require("mongoose");
const connectDB = ()=>{
    mongoose
    .connect(process.env.db_URI)
    .then(() => {
      return console.log("connected");
    })
    .catch((err) => {
      return console.log(err);
    });
}
module.exports = connectDB
