import {defineConfig} from "vite"
import vue from "@vitejs/plugin-vue"
import dts from "vite-plugin-dts"
import vueJsx from "@vitejs/plugin-vue-jsx"

import {EntryPoint} from "../../rollup.config"

export default defineConfig({
    plugins: [
        dts({
            tsconfigPath: "tsconfig.bundle.json",
            copyDtsFiles: true,
            staticImport: true,
            rollupTypes: true,
            outDir: "packages/vue/dist",
            compilerOptions: {
                declarationMap: true,
            },
        }),
        vue(),
        vueJsx(),
    ],
    build: {
        lib: {
            entry: ["output/vue/vue3/src/index.ts"],
            name: "vue",
            fileName: (format) =>
                format === "es" ? `index.js` : `index.${format}.js`,
        },
        rollupOptions: EntryPoint("vue", {}, "vue/vue3"),
    },
})
