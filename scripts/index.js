#!/usr/bin/env node
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { cloneDeep } = require('lodash');
const commander = require('commander');
const chalk = require('chalk');
const packageJson = require('../package.json');

const currentNodeVersion = process.versions.node;
const scriptName = 'Create City Blueprint';
const semver = currentNodeVersion.split('.');
const major = semver[0];

function shCommand(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                console.log(stdout, stderr);
                resolve({});
            }
        });
    });
}

(async () => {
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

    await shCommand(`mkdir "${rootDir}"`).then(() => {
        console.log(
            `Created ${chalk.green(`${rootDir}`)} without error.`
        );
    }).catch(() => {
        console.error(
            `${chalk.bgRed('ERR')}: while attempting to make project directory.`
        );
        process.exit(1);
    });
    const srcFiles = path.resolve(__dirname, '../src');
    await shCommand(`cp -r "${srcFiles}/." "${rootDir}"`).then(() => {
        console.log(
            `Created city framework version ${chalk.green(`${packageJson.version}`)} successfully in ${chalk.green(`${rootDir}`)}`
        );
    }).catch((err) => {
        console.error(
            `${chalk.bgRed('ERR')}: while attempting to setup framework.`
        );
        process.exit(1);
    });
    // Take the .env.example and create an empty .env for the project to readily use
    const text = fs.readFileSync(`${rootDir}/.env.example`).toString('utf-8');
    const textByLine = text.split("\n");
    let finalString = '';
    let numberOfLines = 0;
    textByLine.forEach((item) => {
        const splitString = item.split('=');
        if(splitString[0] !== ''){
            finalString = finalString + splitString[0] + '=' + '\n';
            numberOfLines = numberOfLines + 1;
        }else{
            if(numberOfLines < textByLine.length - 1){
                finalString = finalString + '' + '\n';
                numberOfLines = numberOfLines + 1;
            }
        }
    });
    // Create an empty .env file
    await fs.writeFileSync(`${rootDir}/.env`, finalString);

    // TODO: Implement updates to the package.json
    // Check that we have a package.json
    let projectPackageJson;
    try{
        projectPackageJson = require(`"${rootDir}/package.json"`);
    } catch (e) {
        console.log('Package json does not exist');
    }
    if (projectPackageJson === null || projectPackageJson === undefined){
        // Print that there is no package json
        // Create the package json
        await shCommand(`cd "${rootDir}" && npm init -y`).then(() => {
            // successfully created the default package json file
            projectPackageJson = require(`${rootDir}/package.json`);
        }).catch((err) => {
            // failed to create a default package json file
            console.log(err);
            console.log('Failed to create a default package json');

            // Don't continue if the package.json doesn't exist
            process.exit(1);
        });
    }

    // If the package json exists then we go ahead and run the dependencies

    // check that dependencies key exists
    if((projectPackageJson['dependencies'] === null || projectPackageJson['dependencies'] === undefined)){
        if(packageJson['dependencies'] === null || packageJson['dependencies'] === undefined){
            // then we just set an empty object
            projectPackageJson['dependencies'] = {};
        } else {
            projectPackageJson['dependencies'] = cloneDeep(packageJson.dependencies);
        }
    }else{
        if(packageJson['dependencies'] === null || packageJson['dependencies'] === undefined){
            // then we just take the project package json - do nothing
        } else {
            // Which values do we take?
            // const projectPackageDependencies = Object.keys(projectPackageJson['dependencies']);
            const packageJsonDependencies = Object.keys(packageJson.dependencies);
            // for each of the packageJsonDependencies
                // if already exists in the project AND the versions are different => flag an error
                // if already exists in the project and the version are the same => already well defined
                // else => append to the end of the project json
            packageJsonDependencies.forEach((item) => {
                if(
                    projectPackageJson.dependencies[item] !== null
                    && projectPackageJson.dependencies[item] !== undefined
                    && projectPackageJson.dependencies[item] !== packageJson.dependencies[item]
                ){
                    console.log('There is a versioning error');
                } else if (
                    projectPackageJson.dependencies[item] !== null
                    && projectPackageJson.dependencies[item] !== undefined
                    && projectPackageJson.dependencies[item] === packageJson.dependencies[item]
                ){
                    console.log(`${item} already exists with the correct version - ${packageJson.dependencies[item]}`);
                } else {
                    console.log('Package json needs updating');
                    projectPackageJson.dependencies[item] = packageJson.dependencies[item];
                }
            });
        }
    }

    // TODO: Also install necessary devDependencies
    // check that the devDependencies exist
    // if(projectPackageJson['devDependencies'] === null || projectPackageJson['devDependencies'] === undefined){
    //     if(packageJson['devDependencies'] === null || packageJson['devDependencies'] === undefined){
    //         // then we just set an empty object
    //     } else {
    //         projectPackageJson['devDependencies'] = cloneDeep(packageJson.devDependencies);
    //     }
    // } else {
    //     if(packageJson['devDependencies'] === null || packageJson['devDependencies'] === undefined){
    //         // then we just take the project package json - do nothing
    //     } else {
    //         // Which values do we take?
    //     }
    // }

    // TODO: flush the package json to file
    await fs.writeFileSync(`${rootDir}/package.json`, JSON.stringify(projectPackageJson, null, 2));

    // TODO: run npm install
    await shCommand(`cd "${rootDir}" && npm install`).then(() => {
        // successfully installed the project
    }).catch((err) => {
        // failed to create a default package json file
        console.log(err);

        // failed to install the project - problems

        // Don't continue if the package.json doesn't exist
        process.exit(1);
    });
    // DONE
})();


