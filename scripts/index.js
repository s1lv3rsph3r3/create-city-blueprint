#!/usr/bin/env node
const shell = require('child_process').execSync;
const path = require('path');
const commander = require('commander');
const chalk = require('chalk');
const packageJson = require('../package.json');
const src = '../src';

const currentNodeVersion = process.versions.node;
const scriptName = 'Create City Blueprint';
const semver = currentNodeVersion.split('.');
const major = semver[0];

if (major < 12) {
    console.error(
        `You are running Node ${currentNodeVersion}.\n` +
        `${scriptName} requires Node 12 or higher. \n` +
        'Please update your version of Node.'
    );
    process.exit(1);
}

let projectName = '';
const program = new commander.Command(packageJson.name)
    .version(packageJson.version)
    .arguments('<project-directory>')
    .usage(`${chalk.green('<project-directory>')}`)
    .action(name => {
        projectName = name;
    })
    .on('--help', () => {
        console.log();
        console.log(
            `Only ${chalk.green('<project-directory>')} is required.`
        );
        console.log();
    })
    .parse(process.argv);

// Set path to base directory and project level directory
const baseDir = path.resolve();
const rootDir = path.resolve(projectName);

console.log(
    `Creating new project directory \n ${chalk.green(`${projectName}`)}  =>  ${chalk.cyan(`${baseDir}`)}`
);

try {
    shell(`mkdir "${rootDir}"`);
} catch (e) {
    console.error(
        `${chalk.bgRed('ERR')}: while attempting to make project directory.`
    );
    process.exit(1);
}
console.log(
    `Created ${chalk.green(`${rootDir}`)} without error.`
);
try{
    shell(`cp -r ${src} "${rootDir}"`);
} catch (e) {
    console.error(
        `${chalk.bgRed('ERR')}: while attempting to setup framework.`
    );
    process.exit(1);
}
console.log(
    `Created city framework version ${chalk.green(`${packageJson.version}`)} successfully in ${chalk.green(`${rootDir}`)}`
);


