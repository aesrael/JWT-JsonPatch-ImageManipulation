const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const logger = require("morgan");
const expressValidator = require("express-validator");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongo = require("mongodb");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const multer = require("multer");
const chalk = require("chalk");
const bluebird = require("bluebird");
const crypto = require("crypto");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const index = require("./routes/index");

const config = require("./config/config.js");

/**
 * Load environment variables from .env file,store of API keys and passwords
 */
dotenv.load({ path: ".env.example" });

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || config.mongo);
mongoose.connection.on("error", err => {
  console.error(err);
  console.log(
    "%s MongoDB connection error. Please make sure MongoDB is running.",
    chalk.red("✗")
  );
  process.exit();
});
mongoose.connection.once("open", () => {
  console.log("connection to database established", chalk.green("😁"));
});

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const passportConfig = require("./config/passport.js");

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000"
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/", express.static(path.join(__dirname, "public")));
app.use(logger("dev"));
// Express Session
app.use(
  session({
    secret: config.sessionSecret,
    saveUninitialized: true,
    resave: true
  })
);

// Express Validator
app.use(
  expressValidator({
    errorFormatter: (param, msg, value) => {
      const namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return { param: formParam, msg: msg, value: value };
    }
  })
);

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.errors = req.flash("error");
  res.locals.user = req.user;

  next();
});

app.use("/", index);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
//set port
app.set("port", process.env.PORT || 8080);

//listen to port
app.listen(app.get("port"), function() {
  console.log("server live @ 8080!");
});
module.exports = app;
