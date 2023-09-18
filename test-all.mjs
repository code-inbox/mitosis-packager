import cypress from "cypress"
;["react", "svelte", "solid", "vue"].forEach((framework) => {
  cypress
    .run({
      project: `./packages/${framework}`,
      testingType: "component",
      quiet: true,
      reporter: "../../reporter.cjs",
    })
    .then((results) => {
      if (results.totalFailed) {
        process.exit(1)
      }
    })
})
