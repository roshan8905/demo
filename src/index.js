import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env"
});

/*const express = require("express");
const app = express();*/

connectDB();

/*( async () => {
  try{
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("error", (err) => {
      console.log(err);
      throw err;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log("Server running on port " + (process.env.PORT || 8000));
    });
  }catch(err){
    console.log(err);
  }
})()*/