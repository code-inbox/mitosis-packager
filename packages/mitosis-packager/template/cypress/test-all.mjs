import cypress from "cypress"
import fs from "fs"

Promise.all(
  fs.readdirSync("./packages").map((framework) => {
    cypress
      .run({
        project: `./packages/${framework}`,
        testingType: "component",
        quiet: true,
        reporter: "../../cypress/reporter.cjs",
      })
      .then((results) => {
        if (results.totalFailed) {
          process.exit(1)
        }
      })
  })
).then(() => {
  process.exit(0)
})
