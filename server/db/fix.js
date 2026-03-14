import fs from 'fs';
const v = fs.readFileSync('out.log', 'utf16le');
fs.writeFileSync('out_utf8.log', v);
