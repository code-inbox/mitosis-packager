import {PluginOption, defineConfig} from "vite"
import dts from "vite-plugin-dts"
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

import {Plugin} from "rollup"
import path from "path"

import peerDepsExternal from "rollup-plugin-peer-deps-external"

export default function (framework: string, plugins: PluginOption[] = []) {
    const entry = framework === "vue3" ? "vue/vue3" : framework
    return defineConfig({
        plugins: [
            ...plugins,
            cssInjectedByJsPlugin(),
            dts({
                tsconfigPath: "tsconfig.bundle.json",
                copyDtsFiles: true,
                staticImport: true,
                rollupTypes: true,
                outDir: `packages/${framework}/dist`,
                compilerOptions: {
                    declarationMap: true,
                },
            }),
        ],
        build: {
            lib: {
                entry: [`output/${entry}/src/index.ts`],
                name: framework,
                fileName: (format) =>
                    format === "es" ? `index.js` : `index.${format}.js`,
            },
            outDir: `packages/${framework}/dist`,
            rollupOptions: {
                plugins: [
                    peerDepsExternal({
                        packageJsonPath: path.resolve(
                            process.cwd(),
                            `packages/${framework}/package.json`
                        ),
                    }) as unknown as Plugin<unknown>,
                ],
            },
        },
    })
}
