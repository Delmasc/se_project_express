const express = require("express");
const mongoose = require("mongoose");
const mainRouter = require("./routes/index");
const cors = require("cors");
const { requestLogger, errorLogger } = require("./middlewares/logger");
const { errors } = require("celebrate");
const errorHandler = require("./middlewares/error-handler");

const { PORT = 3001 } = process.env;
const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(console.error);
app.use(cors());
app.use(express.json());

app.use(requestLogger);

app.use(errorLogger); // enabling the error logger

app.use(errors()); // celebrate error handler
app.use(errorHandler);
app.use("/", mainRouter);

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
