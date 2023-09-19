import {defineConfig} from "vite"
import dts from "vite-plugin-dts"

import {EntryPoint} from "../../rollup.config"

export default defineConfig({
    plugins: [dts({
        tsconfigPath: "tsconfig.bundle.json",
        copyDtsFiles: true,
        staticImport: true,
        rollupTypes: true,
        outDir: "packages/react/dist",
        compilerOptions: {
            declarationMap: true,
        },
    })],
    build: {
        lib: {
            entry: ["output/react/src/index.ts"],
            name: "react",
            fileName: (format) =>
                format === "es" ? `index.js` : `index.${format}.js`,
        },
        rollupOptions: EntryPoint("react"),
    },
})
