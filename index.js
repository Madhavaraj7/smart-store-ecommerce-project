const express = require("express");
const helmet = require("helmet");
require("dotenv").config();
const path = require("path");
const session = require("express-session");
const flash = require("express-flash");
const nocache = require("nocache");
const bodyParser = require("body-parser");

const app = express();
app.use(nocache());

const dbConnect = require("./config/dbConnection");
dbConnect();

// Apply Helmet with CSP configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "https://fonts.googleapis.com",
          "'unsafe-inline'", // Required for Google Fonts
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
      },
    },
  })
);

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({ resave: true, saveUninitialized: true, secret: "my secret" })
);

app.use(flash());

// Routes
const userRoute = require("./routes/userRoutes");
const adminRoute = require("./routes/adminRoute");

app.use("/", userRoute);
app.use("/admin", adminRoute);

const PORT = process.env.PORT || 3001;

// 404 Page
app.use("/*", (req, res) => {
  res.render("users/404", { currentUser: req.session.currentUser });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server Started at http://localhost:${PORT}...`);
});
