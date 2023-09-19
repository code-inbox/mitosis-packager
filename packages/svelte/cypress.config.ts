import {defineConfig} from "cypress";
import rootConfig from "../../cypress/root-config"

export default defineConfig({
    component: {
        devServer: {
            framework: "svelte",
            bundler: "vite",
        },
        ...rootConfig.component
    },
});
