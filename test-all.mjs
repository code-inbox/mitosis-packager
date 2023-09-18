import cypress from "cypress"
;["react", "svelte", "solid", "vue"].forEach((framework) => {
  cypress
    .run({
      project: `./packages/${framework}`,
      e2e: false,
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
