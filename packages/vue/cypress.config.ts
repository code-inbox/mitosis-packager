import {defineConfig} from "cypress";
import rootConfig from "../../cypressRootConfig"

export default defineConfig({
    component: {
        devServer: {
            framework: "vue",
            bundler: "vite",
        },
        ...rootConfig.component
    },
});
