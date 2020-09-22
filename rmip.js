/** 
 * A dirty hack that removes lines with imports
*/
const fs = require('fs');
const os = require('os')
const f = fs.readFileSync('parametric.js').toString().split(os.EOL);
const ff = [];
for (const line of f) {
    if (!line.startsWith("import ")) {
        ff.push(line);
    }
}

fs.writeFileSync('parametric.js', ff.join(os.EOL));

