import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env"
});


connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log("Server running on port " + (process.env.PORT || 8000));
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });

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