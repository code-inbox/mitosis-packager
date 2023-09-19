import {defineConfig} from "cypress";
import rootConfig from "../../cypressRootConfig"

export default defineConfig({
    component: {
        devServer: {
            framework: "react",
            bundler: "vite",
        },
        ...rootConfig.component
    },
});
