const express = require("express");
const session = require("express-session");
const passport = require("passport");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "views")));
app.use("/css", express.static(path.join(__dirname, "views/css")));
app.use("/js", express.static(path.join(__dirname, "views/js")));
app.use("/components", express.static(path.join(__dirname, "views/components")));

app.use(
  session({
    secret: "clave_segura",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.status(200).send("LOGIN PAGE TEST");
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

module.exports = app;
