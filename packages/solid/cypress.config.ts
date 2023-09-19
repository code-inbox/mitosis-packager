import {defineConfig} from "cypress";
import rootConfig from "../../cypress/root-config"

export default defineConfig({
    component: {
        devServer: {
            framework: "@dream2023/cypress-ct-solid-js",
            bundler: "vite",
        },
        ...rootConfig.component
    },
});
