const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const tools = express();

tools.use(helmet());
tools.set("trust proxy", 1);

tools.use(bodyParser.urlencoded({ extended: true }));
tools.use(bodyParser.json());

tools.use("/", express.static("./public"));
tools.get("/", (req, res) => res.sendFile("index.html", { root: "./pages/"}));
tools.get("/index.html", (req, res) => res.sendFile("index.html", { root: "./pages/"}));
tools.get("/bigoil.html",  (req, res) => res.sendFile("bigoil.html", { root: "./pages/"}));
tools.get("/mobile.html",  (req, res) => res.sendFile("mobile.html", { root: "./pages/"}));
tools.get("/mask.html",  (req, res) => res.sendFile("mask.html", { root: "./pages/"}));

tools.listen(9999, () => console.log("pd2tools started on port 9999")); // eslint-disable-line no-console
