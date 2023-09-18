"use strict"

const Mocha = require("mocha")
const chalk = require("chalk")

const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END,
} = Mocha.Runner.constants

// this reporter outputs test results, indenting two spaces per suite
class MyReporter {
  constructor(runner) {
    this._indents = 0
    this.name = process.cwd().split("/").pop()
    const stats = runner.stats

    runner
      .once(EVENT_RUN_BEGIN, () => {})
      .on(EVENT_SUITE_BEGIN, () => {})
      .on(EVENT_SUITE_END, () => {})
      .on(EVENT_TEST_FAIL, (test, err) => {
        console.log(
          `${this.indent()}fail: ${this.name} - error: ${err.message}`
        )
      })
      .once(EVENT_RUN_END, () => {
        const state = stats.failures ? "failed" : "succeeded"
        console.log(
          `${state === "failed" ? chalk.red("⛌") : chalk.green("✔")} ${
            this.name
          }: ${stats.passes}/${stats.passes + stats.failures}`
        )
      })
  }

  indent() {
    return Array(this._indents).join("  ")
  }

  increaseIndent() {
    this._indents++
  }

  decreaseIndent() {
    this._indents--
  }
}

module.exports = MyReporter
