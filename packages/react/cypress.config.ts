import {defineConfig} from "cypress";
import rootConfig from "../../cypress/root-config"

export default defineConfig({
    component: {
        devServer: {
            framework: "react",
            bundler: "vite",
        },
        ...rootConfig.component
    },
});
