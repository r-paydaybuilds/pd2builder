const fs = require("fs");
const json = fs.readFileSync(process.argv[2]);
fs.writeFileSync(process.argv[2], JSON.stringify(JSON.parse(json)));