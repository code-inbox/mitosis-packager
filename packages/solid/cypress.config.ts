import {defineConfig} from "cypress";
import rootConfig from "../../cypressRootConfig"

export default defineConfig({
    component: {
        devServer: {
            framework: "@dream2023/cypress-ct-solid-js",
            bundler: "vite",
        },
        specPattern: "../../test.cy.ts",
        indexHtmlFile: "../../index.html",
        supportFile: "./mount.ts",
        ...rootConfig.component
    },
});
