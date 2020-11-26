#!/usr/bin/env node
console.log('-----------');
console.log('Blue print script');
const shell = require('child_process').execSync;

const src = `./src`;
const dist = `./path/dist`;

console.log(__dirname);
shell(`mkdir -p ${dist}`);
shell(`cp -r ${src}/* ${dist}`);

