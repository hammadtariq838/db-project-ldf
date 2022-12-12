const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const cookieParser = require("cookie-parser"); // to make cookies available in req.cookies
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
require("dotenv").config();
const morgan = require("morgan");
const pool = require("./config/db");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// create store connect-pg-simple
const pgSession = require("connect-pg-simple")(session);

// create session store
const sessionStore = new pgSession({
  pool: pool,
  createTableIfMissing: true,
});

// session config
app.use(
  session({
    store: sessionStore,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

app.use(cookieParser());

app.use(flash());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Routes

app.get("/", (req, res) => {
  res.redirect("/posts");
});

app.use("/", require("./routes/users"));
app.use("/profile", require("./routes/profile"));
app.use("/posts", require("./routes/posts"));
app.use("/comments", require("./routes/comments"));

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Application server started on http://localhost:${PORT}`);
});
