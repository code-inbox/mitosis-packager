import {defineConfig} from "vite"
import dts from "vite-plugin-dts"
import {svelte} from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';

import {EntryPoint} from "../../rollup.config"

export default defineConfig({
    plugins: [svelte({
        preprocess: [sveltePreprocess({typescript: true})]
    }), dts({
        tsconfigPath: "tsconfig.bundle.json",
        copyDtsFiles: true,
        staticImport: true,
        rollupTypes: true,
        outDir: "packages/svelte/dist",
        compilerOptions: {
            declarationMap: true,
        },
    })],
    build: {
        lib: {
            entry: ["output/svelte/src/index.ts"],
            name: "svelte",
            fileName: (format) =>
                format === "es" ? `index.js` : `index.${format}.js`,
        },
        rollupOptions: EntryPoint("svelte", {}),
    },
})
