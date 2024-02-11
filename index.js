const express = require("express");
require("dotenv").config();
const path = require("path");

const session = require('express-session')
const bcrypt = require('bcrypt')

const nocache = require("nocache");

const app = express();
app.use(nocache());



const dbConnect = require("./config/dbConnection");
dbConnect();

//VIEW ENGINE
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//requiring bodyparser
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({ resave: true, saveUninitialized: true, secret: "my secret" })
  );

const userRoute = require("./routes/userRoutes");


app.use("/", userRoute);

//for admin route
const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);




const PORT = process.env.PORT || 3001;

//listen to port 3000
app.listen(PORT, () => {
  console.log(`Server Started at http://localhost:${PORT}...`);
});
