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

tools.listen(9999, () => console.log("pd2tools started on port 9999"));