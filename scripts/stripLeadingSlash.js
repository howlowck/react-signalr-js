const fs = require('fs')
const filePath = process.argv[2];
const data = fs.readFileSync(filePath, 'utf8')
let hrefStrip = data.replace(/href="\//g, "href=\"")
let output = hrefStrip.replace(/src="\//g, "src=\"")
fs.writeFileSync(filePath, output)