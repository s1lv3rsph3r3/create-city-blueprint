#!/usr/bin/env node
console.log('-----------');
console.log('Blue print script');
const shell = require('child_process').execSync;
const path = require('path');

const src = `./src`;
const dist = `./path/dist`;

console.log(path.resolve());
shell(`mkdir -p ${dist}`);
shell(`cp -r ${src}/* ${dist}`);

