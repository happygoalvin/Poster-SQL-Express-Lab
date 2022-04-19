const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);

// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// setup sessions
app.use(session({
  'store': new FileStore(),
  'secret': 'keyboard cat',
  'resave': false,
  'saveUninitialized': true
}))

// setup flash message
app.use(flash())

// Register Flash middleware
app.use(function (req, res, next) {
  res.locals.success_messages = req.flash("success_messages");
  res.locals.error_messages = req.flash("error_messages");
  next();
});

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
  express.urlencoded({
    extended: false
  })
);

// import in Routes
const landingRoutes = require('./routes/landing');
const posterRoutes = require('./routes/posters');


async function main() {
  app.use('/', landingRoutes);
  app.use('/posters', posterRoutes);
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});