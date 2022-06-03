var express = require("express");
var authRouter = require("./auth");
var bookRouter = require("./book");
const PrivateRouter = require("./privateRouter");
const PublicRouter = require("./publicRouter");
var app = express();

app.use("/auth/", authRouter);
app.use("/book/", bookRouter);
app.use("/pub/", PublicRouter);
app.use("/pri/", PrivateRouter);

module.exports = app;