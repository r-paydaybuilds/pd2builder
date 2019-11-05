const fs = require("fs");
const json = fs.readFileSync(process.argv[1]);
fs.writeFileSync(JSON.stringify(JSON.parse(json)));