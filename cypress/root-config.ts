// this gets merged with the indidivudal framework config files found in packages/
export default {
    component: {
        specPattern: "../../cypress/test.cy.ts",
        indexHtmlFile: "../../cypress/index.html",
        supportFile: "./mount.ts",
        screenshotOnRunFailure: false
    }
}