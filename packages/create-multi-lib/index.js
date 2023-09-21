#!/usr/bin/env node

/**
 * The following is a fork of a file from the create-react-app project.
 * https://github.com/facebook/create-react-app/blob/main/packages/create-react-app/createReactApp.js
 */

const commander = require("commander")
const fs = require("fs-extra")
const validateProjectName = require("validate-npm-package-name")
const chalk = require("chalk")
const semver = require("semver")
const path = require("path")
const os = require("os")
const spawn = require("cross-spawn")
const execSync = require("child_process").execSync
const dns = require("dns")
const url = require("url")
const prompts = require("prompts")

const packageJson = require("./package.json")

let projectName

function executeNodeScript({ cwd, args }, data, source) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [...args, "-e", source, "--", JSON.stringify(data)],
      { cwd, stdio: "inherit" }
    )

    child.on("close", (code) => {
      if (code !== 0) {
        reject({
          command: `node ${args.join(" ")}`,
        })
        return
      }
      resolve()
    })
  })
}

function isUsingYarn() {
  return (process.env.npm_config_user_agent || "").indexOf("yarn") === 0
}

function checkIfOnline(useYarn) {
  if (!useYarn) {
    // Don't ping the Yarn registry.
    // We'll just assume the best case.
    return Promise.resolve(true)
  }

  return new Promise((resolve) => {
    dns.lookup("registry.yarnpkg.com", (err) => {
      let proxy
      if (err != null && (proxy = getProxy())) {
        // If a proxy is defined, we likely can't resolve external hostnames.
        // Try to resolve the proxy name as an indication of a connection.
        dns.lookup(url.parse(proxy).hostname, (proxyErr) => {
          resolve(proxyErr == null)
        })
      } else {
        resolve(err == null)
      }
    })
  })
}

function getProxy() {
  if (process.env.https_proxy) {
    return process.env.https_proxy
  } else {
    try {
      // Trying to read https-proxy from .npmrc
      let httpsProxy = execSync("npm config get https-proxy").toString().trim()
      return httpsProxy !== "null" ? httpsProxy : undefined
    } catch (e) {
      return
    }
  }
}

function install(root, useYarn, dependencies, isOnline) {
  return new Promise((resolve, reject) => {
    let command
    let args
    if (useYarn) {
      command = "yarnpkg"
      args = ["add", "--exact"]
      if (!isOnline) {
        args.push("--offline")
      }
      ;[].push.apply(args, dependencies)

      // Explicitly set cwd() to work around issues like
      // https://github.com/facebook/create-react-app/issues/3326.
      // Unfortunately we can only do this for Yarn because npm support for
      // equivalent --prefix flag doesn't help with this issue.
      // This is why for npm, we run checkThatNpmCanReadCwd() early instead.
      args.push("--cwd")
      args.push(root)

      if (!isOnline) {
        console.log(chalk.yellow("You appear to be offline."))
        console.log(chalk.yellow("Falling back to the local Yarn cache."))
        console.log()
      }
    } else {
      command = "npm"
      args = [
        "install",
        "--no-audit", // https://github.com/facebook/create-react-app/issues/11174
        "--save",
        "--save-exact",
        "--loglevel",
        "error",
      ].concat(dependencies)
    }

    const child = spawn(command, args, { stdio: "inherit" })
    child.on("close", (code) => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(" ")}`,
        })
        return
      }
      resolve()
    })
  })
}

function isSafeToCreateProjectIn(root, name) {
  if (fs.existsSync(root)) {
    console.log(`The directory ${chalk.green(name)} already exists.`)
    return false
  }
  return true
}

function checkAppName(appName) {
  const validationResult = validateProjectName(appName)
  if (!validationResult.validForNewPackages) {
    console.error(
      chalk.red(
        `Cannot create a project named ${chalk.green(
          `"${appName}"`
        )} because of npm naming restrictions:\n`
      )
    )
    ;[
      ...(validationResult.errors || []),
      ...(validationResult.warnings || []),
    ].forEach((error) => {
      console.error(chalk.red(`  * ${error}`))
    })
    console.error(chalk.red("\nPlease choose a different project name."))
    process.exit(1)
  }
}

function checkNpmVersion() {
  let hasMinNpm = false
  let npmVersion = null
  try {
    npmVersion = execSync("npm --version").toString().trim()
    hasMinNpm = semver.gte(npmVersion, "6.0.0")
  } catch (err) {
    // ignore
  }
  return {
    hasMinNpm: hasMinNpm,
    npmVersion: npmVersion,
  }
}

function checkThatNpmCanReadCwd() {
  const cwd = process.cwd()
  let childOutput = null
  try {
    childOutput = spawn.sync("npm", ["config", "list"]).output.join("")
  } catch (err) {
    return true
  }
  if (typeof childOutput !== "string") {
    return true
  }
  const lines = childOutput.split("\n")
  const prefix = "; cwd = "
  const line = lines.find((line) => line.startsWith(prefix))
  if (typeof line !== "string") {
    return true
  }
  const npmCWD = line.substring(prefix.length)
  if (npmCWD === cwd) {
    return true
  }
  console.error(
    chalk.red(
      `Could not start an npm process in the right directory.\n\n` +
        `The current directory is: ${chalk.bold(cwd)}\n` +
        `However, a newly started npm process runs in: ${chalk.bold(
          npmCWD
        )}\n\n` +
        `This is probably caused by a misconfigured system terminal shell.`
    )
  )
  if (process.platform === "win32") {
    console.error(
      chalk.red(`On Windows, this can usually be fixed by running:\n\n`) +
        `  ${chalk.cyan(
          "reg"
        )} delete "HKCU\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n` +
        `  ${chalk.cyan(
          "reg"
        )} delete "HKLM\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n\n` +
        chalk.red(`Try to run the above two lines in the terminal.\n`) +
        chalk.red(
          `To learn more about this problem, read: https://blogs.msdn.microsoft.com/oldnewthing/20071121-00/?p=24433/`
        )
    )
  }
  return false
}

async function init() {
  const program = new commander.Command(packageJson.name)
    .version(packageJson.version)
    .arguments("<project-directory>")
    .action((name) => {
      projectName = name
    })
    .on("--help", () => {
      console.log(`    Only ${chalk.green("<project-directory>")} is required.`)
      console.log()
      console.log(
        `    If you have any problems, do not hesitate to file an issue:`
      )
      console.log(
        `      ${chalk.cyan(
          "https://github.com/magicbell-io/mitosis-packager/issues/new"
        )}`
      )
      console.log()
    })
    .parse(process.argv)

  if (typeof projectName === "undefined") {
    console.error("Please specify the project directory:")
    console.log(
      `  ${chalk.cyan(program.name())} ${chalk.green("<project-directory>")}`
    )
    console.log()
    console.log("For example:")
    console.log(
      `  ${chalk.cyan(program.name())} ${chalk.green("my-amazing-ui-lib")}`
    )
    console.log()
    console.log(
      `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
    )
    process.exit(1)
  }

  const useYarn = isUsingYarn()
  await createTemplate(
    projectName,
    program.verbose,
    program.scriptsVersion,
    program.template,
    useYarn
  )
}

async function createTemplate(name, verbose, version, template, useYarn) {
  const unsupportedNodeVersion = !semver.satisfies(
    // Coerce strings with metadata (i.e. `15.0.0-nightly`).
    semver.coerce(process.version),
    ">=14"
  )
  if (unsupportedNodeVersion) {
    console.log(
      chalk.yellow(
        `You are using Node ${process.version} which is not supported. Please upgrade to Node 14 or above in order to use this package.\n`
      )
    )
    process.exit(1)
  }

  const root = path.resolve(name)
  const appName = path.basename(root)

  checkAppName(appName)

  if (!isSafeToCreateProjectIn(root, name)) {
    process.exit(1)
  }

  fs.ensureDirSync(name)

  console.log()

  console.log(
    `Creating a new multi-framework library template in ${chalk.green(root)}.`
  )
  console.log()

  const packageJson = {
    name: appName,
    version: "0.1.0",
    private: true,
  }
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify(packageJson, null, 2) + os.EOL
  )

  const originalDirectory = process.cwd()
  process.chdir(root)
  if (!useYarn && !checkThatNpmCanReadCwd()) {
    console.log("Error")
    process.exit(1)
  }
  if (!useYarn) {
    const npmInfo = checkNpmVersion()
    if (!npmInfo.hasMinNpm) {
      if (npmInfo.npmVersion) {
        console.log(
          chalk.yellow(
            `You are using npm ${npmInfo.npmVersion}which is not supported. Please upgrade to NPM version >=6.0.0  or above in order to use this package.\n`
          )
        )
      }
      process.exit(1)
    }
  }

  await run(
    root,
    appName,
    version,
    verbose,
    originalDirectory,
    template,
    useYarn
  )
}

async function run(
  root,
  appName,
  version,
  verbose,
  originalDirectory,
  template,
  useYarn
) {
  const packageToInstall = "mitosis-packager"
  const allDependencies = ["@builder.io/mitosis-cli", "@builder.io/mitosis", "vite", "cypress", "@cypress/mount-utils", "rimraf", "vite-plugin-dts", "vite-plugin-css-injected-by-js", "rollup-plugin-peer-deps-external", packageToInstall]

  const isOnline = checkIfOnline(useYarn)

  console.log("Installing packages. This might take a couple of minutes.")

  await install(root, useYarn, allDependencies, isOnline)

  // fetch the value of the 'constants.js' file that is now in node_modules/mitosis-packager
  const availableFrameworks = fs.readdirSync(path.resolve(
    process.cwd(),
    "node_modules",
    packageToInstall,
    "frameworks"
  ))

  const { frameworks } = await prompts([
    {
      type: "multiselect",
      name: "frameworks",
      message: "Choose the frameworks that your library will support",
      min: 1,
      choices: availableFrameworks.map((framework) => {
        // title is just framework with uppercase first letter
        const title = framework.charAt(0).toUpperCase() + framework.slice(1)
        return {
          title,
          value: framework,
        }
      }),
    },
  ])

  await executeNodeScript(
    {
      cwd: process.cwd(),
      args: [],
    },
    [root, appName, verbose, originalDirectory, frameworks],
    `
                      const init = require('${packageToInstall}/scripts/init.js');
                      init.apply(null, JSON.parse(process.argv[1]));
                  `
  )
}

init()
