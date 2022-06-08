var express = require("express");
var authRouter = require("./auth");
const PrivateRouter = require("./privateRouter");
const PublicRouter = require("./publicRouter");
var app = express();
const authMiddleware = require("../middlewares/jwt");

app.use("/auth/", authRouter);
app.use("/pubs/", PublicRouter);
app.use("/pri/", authMiddleware, PrivateRouter);

module.exports = app;