/** 
 * A dirty hack that replaces the first three lines (which contain import statements) with spaces
*/
const fs = require('fs');
const os = require('os')
const f = fs.readFileSync('parametric.js').toString().split(os.EOL)
for (let i = 0; i < 3; i++) {
    f[i] = " ".repeat(f[i].length);
}

fs.writeFileSync('parametric.js', f.join(os.EOL));

