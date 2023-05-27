// imports
const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const app = express();
const morgan = require("morgan");
const { dataBaseConnection } = require("./dataBaseConnection");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// routers imports
const authRouter = require("./routes/authRouter");
const postRouter = require("./routes/postRouter");

// middlewares
app.use(express.json()); // pass request body
app.use(morgan("common")); // print common thing of any api call - > after controller it running
app.use(cookieParser()); // option also can be provided
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
); // allowed this frontEnd url -> also set arr  -> oring :[url1,url2]

// global middleware to print url & methods called
app.use((req, res, next) => {
  console.log(`[ url : ${req.url} ,  methods : ${req.method} ] `);
  next();
});

// routers
app.use("/auth", authRouter);
app.use("/posts", postRouter);

// server running check
app.get("/", (req, res) => {
  res.status(200).send("Server Running All Fine!");
});

// connect To DataBase
dataBaseConnection();

// lisitening to port
const PORT = process.env.PORT || 9001;
app.listen(PORT, () => {
  console.log(`Listening on port - ${PORT}`);
});
