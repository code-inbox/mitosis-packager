import {defineConfig} from "cypress";
import rootConfig from "../../cypressRootConfig"

export default defineConfig({
    component: {
        devServer: {
            framework: "svelte",
            bundler: "vite",
        },
        ...rootConfig.component
    },
});
