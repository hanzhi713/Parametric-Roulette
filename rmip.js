const fs = require('fs');
const os = require('os')
const f = fs.readFileSync('parametric.js').toString().split(os.EOL).slice(3);

fs.writeFileSync('parametric.js', f.join(os.EOL));

