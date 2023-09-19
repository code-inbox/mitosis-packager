import {defineConfig} from "vite"
import dts from "vite-plugin-dts"
import solid from "vite-plugin-solid"

import {EntryPoint} from "../../rollup.config"

export default defineConfig({
    plugins: [solid(), dts({
        tsconfigPath: "tsconfig.bundle.json",
        copyDtsFiles: true,
        staticImport: true,
        rollupTypes: true,
        outDir: "packages/solid/dist",
        compilerOptions: {
            declarationMap: true,
        },
    })],
    build: {
        lib: {
            entry: ["output/solid/src/index.ts"],
            name: "solid",
            fileName: (format) =>
                format === "es" ? `index.js` : `index.${format}.js`,
        },
        rollupOptions: EntryPoint("solid", {
            jsx: "preserve",
            "jsxImportSource": "solid-js",
        }),
    },
})
