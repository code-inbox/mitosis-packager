const path = require("path")
const fs = require("fs-extra")
const chalk = require("chalk")
const spawn = require("cross-spawn")
const execSync = require("child_process").execSync
const emoji = require("node-emoji")

function tryGitInit() {
  try {
    execSync("git --version", { stdio: "ignore" })
    execSync("git init", { stdio: "ignore" })
    execSync("git branch -m main", { stdio: "ignore" })
    return true
  } catch (e) {
    console.warn("Git repo not initialized", e)
    return false
  }
}

function tryGitCommit(appPath) {
  try {
    execSync("git add -A", { stdio: "ignore" })
    execSync('git commit -m "Initialize project using multi-lib-scripts."', {
      stdio: "ignore",
    })
    return true
  } catch (e) {
    // We couldn't commit in already initialized git repo,
    // maybe the commit author config is not set.
    // In the future, we might supply our own committer
    // like Ember CLI does, but for now, let's just
    // remove the Git files to avoid a half-done state.
    console.warn("Git commit not created", e)
    console.warn("Removing .git directory...")
    try {
      // unlinkSync() doesn't work on directories.
      fs.removeSync(path.join(appPath, ".git"))
    } catch (removeErr) {
      // Ignore.
    }
    return false
  }
}

module.exports = async function (
  appPath,
  appName,
  verbose,
  originalDirectory,
  frameworks
) {
  // first lets write the templates/src folder
  const appPackage = require(path.join(appPath, "package.json"))
  const useYarn = fs.existsSync(path.join(appPath, "yarn.lock"))

  if (!frameworks.length) {
    console.log("No frameworks selected")
    return
  }
  const templatePath = path.join(__dirname, "..", "template")
  fs.copySync(templatePath, appPath)


  // rename ignore to .gitignore
  fs.renameSync(path.join(appPath, "ignore"), path.join(appPath, ".gitignore"))

  fs.ensureDirSync(path.join(appPath, "packages"))

  frameworks = frameworks.filter((framework) => {
    const frameworkPath = path.join(__dirname, "..", "frameworks", framework)
    if (!fs.existsSync(frameworkPath)) {
      console.log(`Framework ${framework} does not exist`)
      return false
    }
    // copy everything from frameworkPath to appPath/packages/framework
    fs.copySync(frameworkPath, path.join(appPath, "packages", framework))

    return true
  })

  // need to install framework-specific dependencies
  const frameworkDeps = frameworks.map((framework) => {
    const frameworkPath = path.join(
      __dirname,
      "..",
      "frameworks",
      framework,
      "package.json"
    )
    const frameworkPackage = require(frameworkPath)
    return frameworkPackage.devDependencies
  })
  const frameworkDepsMerged = Object.assign({}, ...frameworkDeps)
  appPackage.dependencies = Object.assign(
    {},
    appPackage.dependencies,
    frameworkDepsMerged
  )

  // add proper package name to each framework
  for (const framework of frameworks) {
    const frameworkPath = path.join(
      appPath,
      "packages",
      framework,
      "package.json"
    )
    const frameworkPackage = require(frameworkPath)
    frameworkPackage.name = `@${appPackage.name}/${framework}`
    fs.writeFileSync(frameworkPath, JSON.stringify(frameworkPackage, null, 2))
  }

  // Initialize git repo
  let initializedGit = false

  if (tryGitInit()) {
    initializedGit = true
    console.log()
    console.log("Initialized a git repository.")
  }

  appPackage.license = "MIT"

  // now install dependencies
  console.log(
    `Installing framework-specific packages for ${frameworks
      .map((framework) => chalk.green(framework))
      .join(", ")}. This might take a couple of minutes.`
  )

  fs.writeFileSync(
    path.join(appPath, "package.json"),
    JSON.stringify(appPackage, null, 2)
  )

  // run yarn or npm install in "appPath"
  await new Promise((r) => {
    const command = useYarn ? "yarn" : "npm"
    const args = useYarn ? [] : ["install"]
    const proc = spawn(command, args, { stdio: "ignore", cwd: appPath })
    proc.on("close", (code) => {
      if (code !== 0) {
        console.error(`\`${command} ${args.join(" ")}\` failed`)
        r(false)
      } else {
        console.log("Finished installing framework-specific packages")
        r(true)
      }
    })
  })

  // now setup mitosis.config.js
  const mitosisConfigPath = path.join(appPath, "mitosis.config.js")
  const mitosisConfig = fs.readFileSync(mitosisConfigPath, "utf8")
  const newMitosisConfig = mitosisConfig.concat(
    `module.exports = ${JSON.stringify(
      {
        files: "src/**",
        targets: frameworks,
        options: Object.fromEntries(
          frameworks.map((framework) => [
            framework,
            {
              typescript: true,
            },
          ])
        ),
      },
      null,
      2
    )}`
  )
  fs.writeFileSync(mitosisConfigPath, newMitosisConfig, "utf8")

  // setup aliases in tsconfig.json
  const tsconfigPath = path.join(appPath, "tsconfig.json")
  const tsconfig = fs.readFileSync(tsconfigPath, "utf8")
  const newTsconfig = JSON.parse(tsconfig)
  newTsconfig.compilerOptions.paths["@/*"] = frameworks.map((framework) => {
    return `./packages/${framework}`
  })
  fs.writeFileSync(tsconfigPath, JSON.stringify(newTsconfig, null, 2), "utf8")

  // make edits to src/main.lite.tsx
  const mainPath = path.join(appPath, "src", "main.lite.tsx")
  const main = fs.readFileSync(mainPath, "utf8")
  const newMain = main.replace(
    "I can run in ...",
    `I can run in ${
      frameworks.length === 1
        ? frameworks[0]
        : frameworks.slice(0, -1).join(", ")
    }${
      frameworks.length > 1 ? `, or ${frameworks[frameworks.length - 1]}` : ""
    }`
  )
  fs.writeFileSync(mainPath, newMain, "utf8")

  // now make edits to package.json
  appPackage.scripts = {
    mitosis: "mitosis build",
    test: "node cypress/test-all.mjs",
  }

  for (const framework of frameworks) {
    appPackage.scripts[
      `bundle:${framework}`
    ] = `vite build --config packages/${framework}/vite.bundle.mts`
    appPackage.scripts[
      `test:${framework}`
    ] = `cypress open --project ./packages/${framework} --component`
  }

  appPackage.scripts["clean"] = "rimraf ./packages/*/dist"

  appPackage.scripts["bundle:all"] = `${
    useYarn ? "yarn" : "npm"
  } run clean && ${frameworks
    .map((framework) => `npm run bundle:${framework}`)
    .join(" & ")}`
  appPackage.scripts["build"] = `${useYarn ? "yarn" : "npm"} run mitosis && ${
    useYarn ? "yarn" : "npm"
  } run bundle:all && ${useYarn ? "yarn" : "npm"} run test`

  fs.writeFileSync(
    path.join(appPath, "package.json"),
    JSON.stringify(appPackage, null, 2)
  )

  console.log(
    "Finished setting up package.json. Creating an initial git commit..."
  )

  // Create git commit if git repo was initialized
  if (initializedGit && tryGitCommit(appPath)) {
    console.log()
    console.log("Created git commit.")
  }

  // Display the most elegant way to cd.
  // This needs to handle an undefined originalDirectory for
  // backward compatibility with old global-cli's.
  let cdpath
  if (originalDirectory && path.join(originalDirectory, appName) === appPath) {
    cdpath = appName
  } else {
    cdpath = appPath
  }

  // Change displayed command to yarn instead of yarnpkg
  const displayedCommand = useYarn ? "yarn" : "npm"

  console.log()
  console.log(`${emoji.get('tada')} Success! Created ${appName} at ${appPath}`)
  console.log("Inside that directory, you can run several commands:")
  console.log()
  console.log(chalk.cyan(`  ${displayedCommand} build`))
  console.log(
    "    Runs Mitosis and bundles the output into the dist/ folder for each framework."
  )
  console.log()
  console.log(
    chalk.cyan(
      `  ${displayedCommand} ${useYarn ? "" : `run bundle:${frameworks[0]}`}`
    )
  )
  console.log(
    `    Bundles just the ${
      frameworks[0]
    } framework. Can also do the same for other frameworks you have chosen to support (i.e. ${frameworks
      .slice(1)
      .map((f) => chalk.green(f))
      .join(", ")}).`
  )
  console.log()
  console.log(chalk.cyan(`  ${displayedCommand} test`))
  console.log(
    "    Runs Cypress tests across all frameworks. You can also run tests for a specific framework by running e.g.:",
    chalk.cyan(
      `  ${displayedCommand} ${useYarn ? "" : `run test:${frameworks[0]}`}`
    )
  )
  console.log()
  console.log("We suggest that you begin by typing:")
  console.log()
  console.log(chalk.cyan("  cd"), cdpath)
  console.log(`  ${chalk.cyan(`${displayedCommand} run build`)}`)
  console.log()
  console.log("And then run one of the framework-specific Cypress tests. e.g. ")
  console.log(`  ${chalk.cyan(`${displayedCommand} run test:${frameworks[0]}`)}`)
  console.log()
  console.log(`This is an open source project led by ${chalk.underline("https://www.magicbell.com")} and builds upon the fantastic work of the ${chalk.underline("https://www.builder.io/")} team.`)
  console.log()
    console.log(
      `${emoji.get("star")} If you like this project, please consider starring it on GitHub: ${chalk.underline(
        "https://github.com/magicbell-io/mitosis-packager"
      )} ${emoji.get("star")}`
    )
    console.log()
    console.log(`${emoji.get("hammer")} Or even better, consider contributing a bundler to support your favorite framework (available Mitosis compilation targets listed here ${chalk.underline("https://github.com/BuilderIO/mitosis/blob/main/docs/configuration.md")}).`)
    console.log()
    console.log("Have fun!")
    console.log("")
}
